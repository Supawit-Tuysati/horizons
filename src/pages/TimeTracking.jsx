import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getTimeEntries, logTimeEntry } from "../api/time";
import { useAuth } from "../contexts/AuthContext";

import {
  Clock,
  MapPin,
  Home,
  Building2,
  Coffee,
  LogOut,
  Calendar,
  Timer,
} from "lucide-react";

const thaiTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Bangkok",
});

const TimeTracking = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workType, setWorkType] = useState("office");
  const [location, setLocation] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchData = async () => {
      const entries = await getTimeEntries(user.id);
      setTimeEntries(entries || []);
    };
    fetchData();

    return () => clearInterval(timer);
  }, [user.id]);

  const workTypes = [
    { value: "office", label: "ทำงานที่สำนักงาน", icon: Building2 },
    { value: "wfh", label: "Work From Home", icon: Home },
    { value: "field", label: "ทำงานนอกสถานที่", icon: MapPin },
    { value: "meeting", label: "ประชุมลูกค้า", icon: Calendar },
  ];

  const getTodayEntries = () => {
    const today = new Date().toDateString();
    return timeEntries.filter(
      (entry) => new Date(entry.timestamp).toDateString() === today
    );
  };

  const handleTimeEntry = async (action) => {
    // สร้าง Promise เพื่อจัดการ geolocation
    const getLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  toast({
                    title: "ต้องอนุญาตการเข้าถึงตำแหน่งเพื่อบันทึกเวลา",
                    variant: "destructive",
                  });
                  reject(new Error("Location permission denied"));
                  return;
                case error.POSITION_UNAVAILABLE:  // อาจเกิดจากปัญหาเกี่ยวกับ GPS หรือเครือข่าย
                  console.log("ไม่สามารถระบุตำแหน่งได้");
                  reject(new Error("Position unavailable"));
                  return;
                case error.TIMEOUT: // ลองอีกครั้ง หรือแจ้งให้ผู้ใช้ตรวจสอบการเชื่อมต่อ
                  console.log("การดึงข้อมูลตำแหน่งหมดเวลา"); 
                  reject(new Error("Location timeout"));
                  return;
                default:
                  console.log("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการดึงตำแหน่ง");
                  reject(new Error("Unknown location error"));
              }
            },
            {
              enableHighAccuracy: true, // เปิดใช้งานการดึงตำแหน่งด้วยความแม่นยำสูง (อาจใช้แบตเตอรี่มากขึ้น)
              timeout: 10000, // ระยะเวลาสูงสุดที่จะรอการตอบสนอง (10 วินาที)
              maximumAge: 0, // บังคับให้ดึงตำแหน่งใหม่เสมอ (ไม่ใช้ตำแหน่งที่แคชไว้)
            }
          );
        } else {
          console.log("Geolocation ไม่ได้รับการสนับสนุนโดยเบราว์เซอร์นี้");
          reject(new Error("Geolocation not supported"));
        }
      });
    };

    let currentLocation = null;

    try {
      currentLocation = await getLocation(); // รอให้ geolocation ทำงานเสร็จก่อน
      setLocation(currentLocation);
    } catch (error) {
      console.error("Cannot get location:", error.message); // ถ้าไม่สามารถดึงตำแหน่งได้ ให้หยุดการทำงาน
      return;
    }

    // บันทึกเวลาหลังจากได้ตำแหน่งแล้ว
    const entry = {
      user_id: user.id,
      action,
      work_type: workType,
      location: currentLocation
        ? `${currentLocation.latitude},${currentLocation.longitude}`
        : null,
    };

    try {
      const saved = await logTimeEntry(
        entry.user_id,
        entry.action,
        entry.work_type,
        entry.location
      );
      setTimeEntries((prev) => [saved, ...prev]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกเวลาได้",
        variant: "destructive",
      });
      return;
    }

    let message = "";
    switch (action) {
      case "checkin":
        message = `ลงเวลาเข้างานสำเร็จ`;
        break;
      case "checkout":
        message = "ลงเวลาออกงานสำเร็จ";
        break;
      case "break_start":
        message = "เริ่มพักเบรก";
        break;
      case "break_end":
        message = "กลับจากพักเบรก";
        break;
    }

    toast({
      title: "บันทึกเวลาสำเร็จ",
      description: message,
    });
  };

  // ฟังก์ชันสำหรับหาสถานะปัจจุบัน จาก getTodayEntries
  const getCurrentWorkStatus = () => {
    const todayEntries = getTodayEntries();

    if (todayEntries.length === 0) {
      return "offline"; // ยังไม่ได้เข้างาน
    }

    // sort timestamp desc
    const sortedEntries = [...todayEntries].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const latestEntry = sortedEntries[0];

    switch (latestEntry.action) {
      case "checkin":
        return "online";
      case "checkout":
        return "offline";
      case "break_start":
        return "break";
      case "break_end":
        return "online";
      default:
        return "offline";
    }
  };
  const currentStatus = getCurrentWorkStatus();

  const getStatusInfo = (status) => {
    switch (status) {
      case "online":
        return {
          color: "status-online",
          text: "กำลังทำงาน",
        };
      case "break":
        return {
          color: "status-break",
          text: "พักเบรก",
        };
      default:
        return {
          color: "status-offline",
          text: "ออฟไลน์",
        };
    }
  };
  const { color, text } = getStatusInfo(currentStatus);
  return (
    <>
      <Helmet>
        <title>ลงเวลาเข้า-ออกงาน | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta
          name="description"
          content="ลงเวลาเข้า-ออกงาน พร้อมระบุประเภทการทำงานและตำแหน่ง"
        />
      </Helmet>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold text-white">ลงเวลาเข้า-ออกงาน</h1>
            <div className="glass-effect rounded-lg p-6 max-w-md mx-auto">
              <div
                className={`w-4 h-4 rounded-full ${color} mx-auto mb-2 pulse-animation`}
              ></div>
              <p className="text-xl font-semibold text-white">{text}</p>
              <p className="text-2xl font-mono text-white mt-2">
                {currentTime.toLocaleTimeString("th-TH", {
                  timeZone: "Asia/Bangkok",
                })}
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Time Entry Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-6 w-6 mr-2" />
                    ลงเวลาทำงาน
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    เลือกประเภทการทำงานและลงเวลา
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-white font-medium">
                      ประเภทการทำงาน
                    </label>
                    <Select value={workType} onValueChange={setWorkType}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <Icon className="h-4 w-4 mr-2" />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {location && (
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>
                        ตำแหน่ง: {location.latitude.toFixed(4)},{" "}
                        {location.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleTimeEntry("checkin")}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      disabled={
                        currentStatus === "online" || currentStatus === "break"
                      }
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      เข้างาน
                    </Button>

                    <Button
                      onClick={() => handleTimeEntry("checkout")}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                      disabled={currentStatus === "offline"}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ออกงาน
                    </Button>

                    <Button
                      onClick={() => handleTimeEntry("break_start")}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                      disabled={currentStatus !== "online"}
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      เริ่มพัก
                    </Button>

                    <Button
                      onClick={() => handleTimeEntry("break_end")}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      disabled={currentStatus !== "break"}
                    >
                      <Timer className="h-4 w-4 mr-2" />
                      กลับจากพัก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Today's Entries */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">บันทึกวันนี้</CardTitle>
                  <CardDescription className="text-white/70">
                    ประวัติการลงเวลาในวันนี้
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getTodayEntries().length === 0 ? (
                      <p className="text-white/70 text-center py-8">
                        ยังไม่มีการลงเวลาในวันนี้
                      </p>
                    ) : (
                      getTodayEntries().map((entry) => {
                        const time = thaiTimeFormatter.format(
                          new Date(entry.timestamp)
                        );
                        const workTypeLabel = workTypes.find(
                          (t) => t.value === entry.work_type
                        )?.label;

                        let actionText = "";
                        let actionColor = "";

                        switch (entry.action) {
                          case "checkin":
                            actionText = "เข้างาน";
                            actionColor = "text-green-400";
                            break;
                          case "checkout":
                            actionText = "ออกงาน";
                            actionColor = "text-red-400";
                            break;
                          case "break_start":
                            actionText = "เริ่มพัก";
                            actionColor = "text-yellow-400";
                            break;
                          case "break_end":
                            actionText = "กลับจากพัก";
                            actionColor = "text-blue-400";
                            break;
                        }

                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                          >
                            <div>
                              <p className={`font-semibold ${actionColor}`}>
                                {actionText}
                              </p>
                              <p className="text-white/70 text-sm">
                                {workTypeLabel}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-mono">{time}</p>
                              {entry.location && (
                                <p className="text-white/50 text-xs">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  ตำแหน่งบันทึกแล้ว
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TimeTracking;

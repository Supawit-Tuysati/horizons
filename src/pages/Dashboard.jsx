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
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  MapPin,
  Coffee,
  Home,
  Building2,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { getTimeWorkToDay } from "../api/time";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { workStatus } = useState("offline");
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [todayHours, setTodayHours] = useState("0.00 ชั่วโมง");

  const handleQuickAction = (system_status, action) => {
    if (system_status === "develop") {
      toast({
        title: "🚧 ฟีเจอร์นี้ยังไม่ได้พัฒนา",
        description:
          "แต่ไม่ต้องกังวล! คุณสามารถขอให้เพิ่มฟีเจอร์นี้ในข้อความถัดไป! 🚀",
      });
    } else {
      navigate(action);
    }
  };

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const calculateWorkTime = (entries) => {
    // ฟังก์ชันคำนวณเวลาทำงานจากรายการ entries
    // ตัวแปรสำหรับเก็บเวลาต่างๆ
    let checkIn = null; // เวลาเข้างาน
    let checkOut = null; // เวลาออกงาน
    let breakStart = null; // เวลาเริ่มพัก (ชั่วคราว)
    const breaks = []; // อาร์เรย์เก็บช่วงเวลาพักทั้งหมด

    // วนลูปผ่าน entries ทั้งหมดเพื่อจัดกลุ่มตาม action
    for (const entry of entries) {
      const t = new Date(entry.timestamp); // แปลง timestamp เป็น Date object

      switch (entry.action) {
        case "checkin":
          checkIn = t; // บันทึกเวลาเข้างาน
          break;
        case "checkout":
          checkOut = t; // บันทึกเวลาออกงาน
          break;
        case "break_start":
          breakStart = t; // บันทึกเวลาเริ่มพัก
          break;
        case "break_end":
          // ถ้ามี breakStart แล้ว ให้สร้างช่วงเวลาพัก
          if (breakStart) {
            breaks.push({ start: breakStart, end: t });
            breakStart = null; // reset ค่า
          }
          break;
      }
    }

    // ถ้าไม่มีการเข้างาน ให้คืนค่า 0
    if (!checkIn) return "0.00 ชั่วโมง";

    // กำหนดเวลาสิ้นสุด (ถ้ายังไม่ได้ checkout ให้ใช้เวลาปัจจุบัน)
    const now = new Date();
    const end = checkOut || now;

    // ถ้ายังอยู่ในช่วงพัก (breakStart มีค่า) ให้นับเป็นช่วงพักด้วย
    if (breakStart) {
      breaks.push({ start: breakStart, end });
    }

    // คำนวณเวลาพักรวม (หน่วย: นาที)
    const totalBreak = breaks.reduce(
      (acc, b) => acc + Math.max(0, (b.end - b.start) / 60000), // แปลง milliseconds เป็นนาที
      0
    );

    // คำนวณเวลาทำงานสุทธิ = เวลาทั้งหมด - เวลาพัก
    const totalWork = Math.max(0, (end - checkIn) / 60000 - totalBreak);

    // แปลงเป็นชั่วโมงและนาที
    const hours = Math.floor(totalWork / 60); // ชั่วโมงเต็ม
    const minutes = Math.floor(totalWork % 60); // นาทีที่เหลือ (ปัดลง)

    // ส่งคืนในรูปแบบ "ชั่วโมง:นาที ชั่วโมง"
    return `${hours}:${minutes.toString().padStart(2, "0")} ชั่วโมง`;
  };

  // useEffect แรก: ดึงข้อมูลเริ่มต้นเมื่อ user.id เปลี่ยน
  useEffect(() => {
    if (!user?.id) return; // ถ้าไม่มี user id ให้หยุด

    const fetchInitialTime = async () => {
      try {
        // ดึงข้อมูลการทำงานของวันนี้
        const data = await getTimeWorkToDay(user.id);
        setEntries(data); // เก็บ entries ไว้ใน state

        // คำนวณและแสดงเวลาทำงาน
        const formattedTime = calculateWorkTime(data);
        setTodayHours(formattedTime);
      } catch (err) {
        console.error("Error:", err);
        setTodayHours("0.00 ชั่วโมง"); // ถ้าเกิดข้อผิดพลาด แสดง 0
      }
    };

    fetchInitialTime();
  }, [user?.id]);

  // useEffect ที่สอง: อัปเดตเวลาทำงานแบบ real-time
  useEffect(() => {
    if (entries.length === 0) return; // ถ้าไม่มี entries ให้หยุด

    // ตั้งตัวจับเวลาให้คำนวณใหม่ทุกนาที
    const interval = setInterval(() => {
      const formattedTime = calculateWorkTime(entries); // ใช้ข้อมูล entries เดิม
      setTodayHours(formattedTime); // อัปเดต UI
    }, 60 * 1000); // ทุก 60 วินาที (1 นาที)

    // ล้าง interval เมื่อ component unmount หรือ entries เปลี่ยน
    return () => clearInterval(interval);
  }, [entries]);

  const quickActions = [
    {
      icon: Clock,
      label: "ลงเวลาเข้างาน",
      system_status: "success",
      action: "/time-tracking",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Coffee,
      label: "พักเบรก",
      system_status: "develop",
      action: "",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Home,
      label: "Work From Home",
      system_status: "develop",
      action: "",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Calendar,
      label: "ขอลางาน",
      system_status: "success",
      action: "/leave-management",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const stats = [
    {
      title: "ชั่วโมงทำงานวันนี้",
      value: todayHours,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      title: "วันลาคงเหลือ",
      value: "12 วัน",
      icon: Calendar,
      color: "text-green-400",
    },
    {
      title: "สถานะปัจจุบัน",
      value:
        workStatus === "online"
          ? "ทำงาน"
          : workStatus === "break"
          ? "พักเบรก"
          : "ออฟไลน์",
      icon: Users,
      color: "text-purple-400",
    },
    {
      title: "เข้างานสัปดาห์นี้",
      value: "5/5 วัน",
      icon: CheckCircle,
      color: "text-emerald-400",
    },
  ];

  return (
    <>
      <Helmet>
        <title>แดชบอร์ | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta name="description" content="ภาพรวมการทำงานและสถิติการลงเวลา" />
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
            <h1 className="text-4xl font-bold text-white">แดชบอร์ด</h1>
            <div className="glass-effect rounded-lg p-6 max-w-md mx-auto">
              <p className="text-2xl font-mono text-white">
                {currentTime.toLocaleTimeString("th-TH")}
              </p>
              <p className="text-white/70">
                {currentTime.toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              การดำเนินการด่วน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className="glass-effect border-white/20 card-hover cursor-pointer"
                      onClick={() =>
                        handleQuickAction(action.system_status, action.action)
                      }
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-4`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-white font-semibold">
                          {action.label}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              สถิติการทำงาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-white/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">
                              {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {stat.value}
                            </p>
                          </div>
                          <Icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">กิจกรรมล่าสุด</CardTitle>
                <CardDescription className="text-white/70">
                  ประวัติการลงเวลาและกิจกรรมต่างๆ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <div className="flex-1">
                      <p className="text-white">เข้างานเวลา 09:00 น.</p>
                      <p className="text-white/70 text-sm">วันนี้</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="flex-1">
                      <p className="text-white">พักเบรกเวลา 12:00 น.</p>
                      <p className="text-white/70 text-sm">วันนี้</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="flex-1">
                      <p className="text-white">ขอลาป่วย 1 วัน</p>
                      <p className="text-white/70 text-sm">
                        เมื่อวาน - อนุมัติแล้ว
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;

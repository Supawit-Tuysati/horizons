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
  const [todayHours, setTodayHours] = useState("0:00");
  const { toast } = useToast();
  const { user } = useAuth();

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

  useEffect(() => {
    if (!user?.id) return;
    const fetchTime = async () => {
      try {
        const result = await getTimeWorkToDay(user.id);
        const { totalHours, totalMinutes } = result;
        const formattedTime = `${totalHours}:${totalMinutes
          .toString()
          .padStart(2, "0")} ชั่วโมง`;
        setTodayHours(formattedTime);
      } catch (err) {
        console.error("Error fetching time:", err);
        setTodayHours("0.00 ชั่วโมง");
      }
    };

    fetchTime(); // รันรอบแรกก่อน

    // Timer: ดึงใหม่ทุก 1 นาที
    const fetchTimer = setInterval(fetchTime, 60 * 1000);

    return () => clearInterval(fetchTimer);
  }, [user?.id]);

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

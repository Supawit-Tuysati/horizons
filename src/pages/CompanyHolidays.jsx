import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../lib/supabaseClient";
import { Calendar, Star, Gift, Heart, Sparkles, Crown, TreePine, Flower,} from "lucide-react";

const CompanyHolidays = () => {
  const [holidays, setHolidays] = useState([]);

  const fetchHolidays = async () => {
    const { data } = await supabase
      .from("company_holidays")
      .select("*")
      .order("date");
    setHolidays(data || []);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const { toast } = useToast();

  const getMonthName = (month) => {
    const months = [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return months[month];
  };

  const groupHolidaysByMonth = () => {
    const grouped = {};
    holidays.forEach((holiday) => {
      const date = new Date(holiday.date);
      const month = date.getMonth();
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(holiday);
    });
    return grouped;
  };

  const handleAddToCalendar = (holiday) => {
    toast({
      title: "🚧 ฟีเจอร์นี้ยังไม่ได้พัฒนา",
      description:
        "แต่ไม่ต้องกังวล! คุณสามารถขอให้เพิ่มฟีเจอร์นี้ในข้อความถัดไป! 🚀",
    });
  };

  const groupedHolidays = groupHolidaysByMonth();

  return (
    <>
      <Helmet>
        <title>วันหยุดบริษัท | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta
          name="description"
          content="ปฏิทินวันหยุดราชการและวันหยุดพิเศษของบริษัท"
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
            <h1 className="text-4xl font-bold text-white">วันหยุดบริษัท</h1>
            <p className="text-white/70 text-lg">
              ปฏิทินวันหยุดราชการและวันหยุดพิเศษ ปี{" "}
              {new Date().getFullYear() + 543}
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm">วันหยุดราชการ</p>
                  <p className="text-2xl font-bold text-white">
                    {holidays.filter((h) => h.type === "national").length} วัน
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6 text-center">
                  <Gift className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm">วันหยุดบริษัท</p>
                  <p className="text-2xl font-bold text-white">
                    {holidays.filter((h) => h.type === "company").length} วัน
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-effect border-white/20">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm">รวมทั้งหมด</p>
                  <p className="text-2xl font-bold text-white">
                    {holidays.length} วัน
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Holidays by Month */}
          <div className="space-y-6">
            {Object.entries(groupedHolidays).map(([month, holidays]) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: parseInt(month) * 0.1 }}
              >
                <Card className="glass-effect border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calendar className="h-6 w-6 mr-2" />
                      {getMonthName(parseInt(month))}  {new Date().getFullYear() + 543}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {holidays.length} วันหยุด
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {holidays.map((holiday) => {
                        const Icon = holiday.icon;
                        const date = new Date(holiday.date);
                        const dayName = date.toLocaleDateString("th-TH", {
                          weekday: "long",
                        });
                        const dateStr = date.toLocaleDateString("th-TH");

                        return (
                          <motion.div
                            key={holiday.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 card-hover"
                          >
                            <div className="flex items-center space-x-4">
                              {/* <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-r ${holiday.color} flex items-center justify-center`}
                              >
                                <Icon className="h-6 w-6 text-white" />
                              </div> */}
                              <div>
                                <h3 className="text-white font-semibold">
                                  {holiday.name}
                                </h3>
                                <p className="text-white/70 text-sm">
                                  {holiday.description}
                                </p>
                                <p className="text-white/50 text-xs">
                                  {dayName}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-mono text-lg">
                                {dateStr}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCalendar(holiday)}
                                className="mt-2 border-white/20 text-white hover:bg-white/10"
                              >
                                เพิ่มในปฏิทิน
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">คำอธิบาย</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <span className="text-white/70 text-sm">วันหยุดราชการ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    <span className="text-white/70 text-sm">
                      วันหยุดพิเศษบริษัท
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}
        </div>
      </Layout>
    </>
  );
};

export default CompanyHolidays;

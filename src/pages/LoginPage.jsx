import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Mail, Lock, Building2 } from "lucide-react";
import { Helmet } from "react-helmet";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) {
        toast({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "ยินดีต้อนรับเข้าสู่ระบบลงเวลาเข้า-ออกงาน",
        });
        navigate("/");
      }
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>เข้าสู่ระบบ | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta name="description" content="เข้าสู่ระบบจัดการเวลาทำงานและลางาน" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-6"
          >
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center floating-animation">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  TimeTracker Pro
                </h1>
                <p className="text-white/70">ระบบจัดการเวลาทำงาน</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                จัดการเวลาทำงาน
                <span className="block gradient-text">อย่างมืออาชีพ</span>
              </h2>
              <p className="text-xl text-white/80 max-w-lg">
                ระบบลงเวลาเข้า-ออกงานที่ทันสมัย
                พร้อมฟีเจอร์ครบครันสำหรับองค์กรยุคใหม่
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
              <div className="glass-effect rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm">ลงเวลาแม่นยำ</p>
              </div>
              <div className="glass-effect rounded-lg p-4 text-center">
                <Building2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white text-sm">จัดการลางาน</p>
              </div>
              <div className="glass-effect rounded-lg p-4 text-center">
                <Mail className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm">แจ้งเตือนอัตโนมัติ</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md glass-effect border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  เข้าสู่ระบบ
                </CardTitle>
                <CardDescription className="text-white/70">
                  กรอกข้อมูลเพื่อเข้าสู่ระบบ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      อีเมล
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="กรอกอีเมลของคุณ"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      รหัสผ่าน
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="กรอกรหัสผ่านของคุณ"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm">
                    ใช้อีเมลและรหัสผ่านใดก็ได้เพื่อทดสอบระบบ
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

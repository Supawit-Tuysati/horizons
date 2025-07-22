import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Shield, MapPin, Clock, Smartphone, Mail, Save,} from "lucide-react";
import { getProfileAndSetting, updateProfile, updateProfileAndSetting,} from "../api/profiles";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {email: false, push: false, sms: false, workReminders: false, leaveUpdates: false, },
    privacy: { shareLocation: true, showStatus: false, publicProfile: false },
    workPreferences: { autoCheckout: false, breakReminders: false, overtimeAlerts: false,},
  });

  useEffect(() => {
    const fetchProfileSetting = async () => {
      if (user?.id) {
        try {
          const data = await getProfileAndSetting(user.id);

          setProfile({
            full_name: data.full_name,
            department: data.department,
            employeeId: data.employee_id,
          });

          const settingsFromDB = data.user_settings?.[0];
          if (settingsFromDB) {
            setSettings({
              notifications: {
                email: settingsFromDB.email_notifications,
                push: settingsFromDB.push_notifications,
                sms: settingsFromDB.sms_notifications,
                workReminders: settingsFromDB.worktime_reminder,
                leaveUpdates: settingsFromDB.leave_status_update,
              },
              privacy: {
                shareLocation: settingsFromDB.share_location,
                showStatus: settingsFromDB.show_online_status,
                publicProfile: settingsFromDB.public_profile,
              },
              workPreferences: {
                autoCheckout: settingsFromDB.auto_checkout,
                breakReminders: settingsFromDB.break_reminder,
                overtimeAlerts: settingsFromDB.overtime_alert,
              },
            });
          }
        } catch (err) {
          console.error("เกิดข้อผิดพลาดในการดึงโปรไฟล์", err);
        }
      }
    };

    fetchProfileSetting();
  }, []);

  const handleSettingsChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        full_name: profile.full_name,
        department: profile.department,
      };
      console.log("Saving profile data:", updatedProfile);

      await updateProfile(user.id, updatedProfile);

      toast({
        title: "✅ บันทึกสำเร็จ",
        description: "ข้อมูลของคุณได้รับการอัปเดตแล้ว",
      });
    } catch (err) {
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
      });
      console.error("Update profile error:", err);
    }
  };

  const handleSaveAllSetting = async () => {
    try {
      const profileData = {
        full_name: profile.full_name,
        department: profile.department,
      };

      const settingsData = {
        email_notifications: settings.notifications.email,
        push_notifications: settings.notifications.push,
        sms_notifications: settings.notifications.sms,
        worktime_reminder: settings.notifications.workReminders,
        leave_status_update: settings.notifications.leaveUpdates,
        share_location: settings.privacy.shareLocation,
        show_online_status: settings.privacy.showStatus,
        public_profile: settings.privacy.publicProfile,
        auto_checkout: settings.workPreferences.autoCheckout,
        break_reminder: settings.workPreferences.breakReminders,
        overtime_alert: settings.workPreferences.overtimeAlerts,
      };

      await updateProfileAndSetting(user.id, profileData, settingsData);

      toast({
        title: "✅ บันทึกสำเร็จ",
        description: "การตั้งค่าของคุณได้รับการอัปเดตแล้ว",
      });
    } catch (err) {
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่",
      });
      console.error("Update settings error:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>ตั้งค่า | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta
          name="description"
          content="จัดการการตั้งค่าบัญชีและความเป็นส่วนตัว"
        />
      </Helmet>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white">ตั้งค่า</h1>
            <p className="text-white/70 mt-2">
              จัดการการตั้งค่าบัญชีและความเป็นส่วนตัว
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    ข้อมูลส่วนตัว
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    จัดการข้อมูลบัญชีของคุณ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      ชื่อ-นามสกุล
                    </Label>
                    <Input
                      id="name"
                      value={profile?.full_name || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      อีเมล
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-white">
                      แผนก
                    </Label>
                    <Input
                      id="department"
                      value={profile?.department || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-white">
                      รหัสพนักงาน
                    </Label>
                    <Input
                      id="employeeId"
                      defaultValue={profile?.employeeId}
                      disabled
                      className="bg-white/5 border-white/20 text-white/70"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    บันทึกข้อมูล
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="h-6 w-6 mr-2" />
                    การแจ้งเตือน
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    จัดการการแจ้งเตือนต่างๆ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-white/70" />
                        <span className="text-white">แจ้งเตือนทางอีเมล</span>
                      </div>
                      <Switch
                        checked={settings?.notifications?.email || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "email",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-white/70" />
                        <span className="text-white">Push Notification</span>
                      </div>
                      <Switch
                        checked={settings?.notifications?.push || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("notifications", "push", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-white/70" />
                        <span className="text-white">แจ้งเตือน SMS</span>
                      </div>
                      <Switch
                        checked={settings?.notifications?.sms || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("notifications", "sms", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-white/70" />
                        <span className="text-white">เตือนลงเวลาทำงาน</span>
                      </div>
                      <Switch
                        checked={
                          settings?.notifications?.workReminders || false
                        }
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "workReminders",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-white/70" />
                        <span className="text-white">อัพเดทสถานะลางาน</span>
                      </div>
                      <Switch
                        checked={settings?.notifications?.leaveUpdates || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "notifications",
                            "leaveUpdates",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-6 w-6 mr-2" />
                    ความเป็นส่วนตัว
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    จัดการการแชร์ข้อมูลและความเป็นส่วนตัว
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-white/70" />
                        <span className="text-white">แชร์ตำแหน่งที่ตั้ง</span>
                      </div>
                      <Switch
                        checked={settings?.privacy?.shareLocation || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "privacy",
                            "shareLocation",
                            checked
                          )
                        }
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-white/70" />
                        <span className="text-white">แสดงสถานะออนไลน์</span>
                      </div>
                      <Switch
                        checked={settings?.privacy?.showStatus || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("privacy", "showStatus", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-white/70" />
                        <span className="text-white">โปรไฟล์สาธารณะ</span>
                      </div>
                      <Switch
                        checked={settings?.privacy?.publicProfile || false}
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "privacy",
                            "publicProfile",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Work Preferences */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-6 w-6 mr-2" />
                    การตั้งค่าการทำงาน
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    ปรับแต่งการทำงานให้เหมาะกับคุณ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-white/70" />
                        <span className="text-white">ออกงานอัตโนมัติ</span>
                      </div>
                      <Switch
                        checked={
                          settings?.workPreferences?.autoCheckout || false
                        }
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "workPreferences",
                            "autoCheckout",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-white/70" />
                        <span className="text-white">เตือนพักเบรก</span>
                      </div>
                      <Switch
                        checked={
                          settings?.workPreferences?.breakReminders || false
                        }
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "workPreferences",
                            "breakReminders",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-white/70" />
                        <span className="text-white">
                          แจ้งเตือนทำงานล่วงเวลา
                        </span>
                      </div>
                      <Switch
                        checked={
                          settings?.workPreferences?.overtimeAlerts || false
                        }
                        onCheckedChange={(checked) =>
                          handleSettingsChange(
                            "workPreferences",
                            "overtimeAlerts",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleSaveAllSetting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-3"
            >
              <Save className="h-5 w-5 mr-2" />
              บันทึกการตั้งค่าทั้งหมด
            </Button>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Settings;

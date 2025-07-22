import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getLeaveRequests, requestLeave } from "../api/leaveManagement";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, FileText, User} from 'lucide-react';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({type: '', startDate: '', endDate: '', reason: '', days: 1});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchRequests = async () => {
      const data = await getLeaveRequests(user.id);
      setLeaveRequests(data);
    };
    fetchRequests();
  }, [user]);

  const leaveTypes = [
    { value: 'annual', label: 'ลาพักผ่อน', color: 'text-blue-400' },
    { value: 'sick', label: 'ลาป่วย', color: 'text-red-400' },
    { value: 'personal', label: 'ลากิจ', color: 'text-yellow-400' },
    { value: 'maternity', label: 'ลาคลอด', color: 'text-pink-400' },
    { value: 'emergency', label: 'ลาฉุกเฉิน', color: 'text-orange-400' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitted = await requestLeave(
        user.id,
        formData.type,
        formData.startDate,
        formData.endDate,
        formData.reason
      );

      setLeaveRequests(prev => [...prev, submitted]);

      toast({
        title: "ส่งคำขอลางานสำเร็จ",
        description: "คำขอของคุณอยู่ระหว่างการพิจารณา",
      });

      setFormData({ type: '', startDate: '', endDate: '', reason: '', days: 1 });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำขอลาได้",
        variant: "destructive",
      });
    }
  };

  const getStatusMeta = (status) => {
  switch (status) {
    case "approved":
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        text: "อนุมัติแล้ว",
        color: "text-green-400",
      };
    case "rejected":
      return {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        text: "ไม่อนุมัติ",
        color: "text-red-400",
      };
    default:
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
        text: "รอพิจารณา",
        color: "text-yellow-400",
      };
  }
};


  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    const days = calculateDays(formData.startDate, formData.endDate);
    setFormData(prev => ({ ...prev, days }));
  }, [formData.startDate, formData.endDate]);

  return (
    <>
      <Helmet>
        <title>จัดการลางาน | ระบบลงเวลาเข้า-ออกงาน</title>
        <meta name="description" content="ขอลางานและติดตามสถานะคำขอลางาน" />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">จัดการลางาน</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />ขอลางาน
            </Button>
          </motion.div>

          {/* Leave Balance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-effect border-white/20"><CardContent className="p-6 text-center"><Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" /><p className="text-white/70 text-sm">ลาพักผ่อนคงเหลือ</p><p className="text-2xl font-bold text-white">12 วัน</p></CardContent></Card>
              <Card className="glass-effect border-white/20"><CardContent className="p-6 text-center"><FileText className="h-8 w-8 text-red-400 mx-auto mb-2" /><p className="text-white/70 text-sm">ลาป่วยคงเหลือ</p><p className="text-2xl font-bold text-white">30 วัน</p></CardContent></Card>
              <Card className="glass-effect border-white/20"><CardContent className="p-6 text-center"><User className="h-8 w-8 text-yellow-400 mx-auto mb-2" /><p className="text-white/70 text-sm">ลากิจคงเหลือ</p><p className="text-2xl font-bold text-white">3 วัน</p></CardContent></Card>
              <Card className="glass-effect border-white/20"><CardContent className="p-6 text-center"><Clock className="h-8 w-8 text-green-400 mx-auto mb-2" /><p className="text-white/70 text-sm">ใช้ไปแล้วปีนี้</p><p className="text-2xl font-bold text-white">8 วัน</p></CardContent></Card>
            </div>
          </motion.div>

          {/* Leave Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              <Card className="glass-effect border-white/20">
                <CardHeader><CardTitle className="text-white">ขอลางาน</CardTitle><CardDescription className="text-white/70">กรอกข้อมูลการขอลางาน</CardDescription></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-white">ประเภทการลา</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="เลือกประเภทการลา" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">จำนวนวัน</Label>
                        <Input type="number" value={formData.days} readOnly className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-white">วันที่เริ่มลา</Label>
                        <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-white">วันที่สิ้นสุด</Label>
                        <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-white">เหตุผลการลา</Label>
                      <Textarea id="reason" placeholder="กรอกเหตุผลการลา" value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" rows={3} />
                    </div>
                    <div className="flex space-x-4">
                      <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">ส่งคำขอ</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/20 text-white hover:bg-white/10">ยกเลิก</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leave Request History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="glass-effect border-white/20">
              <CardHeader><CardTitle className="text-white">ประวัติการขอลางาน</CardTitle><CardDescription className="text-white/70">รายการคำขอลางานทั้งหมด</CardDescription></CardHeader>
              <CardContent>
               <div className="space-y-4">
                  {leaveRequests.length === 0 ? (
                    <p className="text-white/70 text-center py-8">ยังไม่มีประวัติการขอลางาน</p>
                  ) : (
                    leaveRequests.map((request) => {
                      const leaveType = leaveTypes.find((t) => t.value === request.leave_type);
                      const submittedDate = new Date(request.created_at).toLocaleDateString("th-TH");
                      const { icon, text, color } = getStatusMeta(request.status);

                      return (
                        <div
                          key={request.id}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base">
                                <span className={`font-semibold ${leaveType?.color}`}>{leaveType?.label}</span>
                                <span className="text-white/70">•</span>
                                <span className="text-white">
                                  {calculateDays(request.start_date, request.end_date)} วัน
                                </span>
                              </div>
                              <p className="text-white/70 text-sm">
                                {new Date(request.start_date).toLocaleDateString("th-TH")} -{" "}
                                {new Date(request.end_date).toLocaleDateString("th-TH")}
                              </p>
                              <p className="text-white">{request.reason}</p>
                              <p className="text-white/50 text-xs">ส่งคำขอเมื่อ: {submittedDate}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {icon}
                              <span className={`font-semibold ${color}`}>{text}</span>
                            </div>
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
      </Layout>
    </>
  );
};

export default LeaveManagement;
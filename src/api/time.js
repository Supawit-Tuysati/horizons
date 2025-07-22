import { supabase } from "../lib/supabaseClient";

export async function getTimeEntries(user_id) {

  const now = new Date();

  // ช่วงเวลาวันนี้ UTC
  const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const startOfDayISOString = startOfDayUTC.toISOString();
  const endOfDayISOString = endOfDayUTC.toISOString();

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", user_id)
    .gte("timestamp", startOfDayISOString)
    .lte("timestamp", endOfDayISOString)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching time entries:", error);
    return [];
  }
  return data;
}

export async function getTimeWorkToDay(user_id) {
  const now = new Date();

  // ช่วงเวลาวันนี้ UTC
  const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const startOfDayISOString = startOfDayUTC.toISOString();
  const endOfDayISOString = endOfDayUTC.toISOString();

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", user_id)
    .gte("timestamp", startOfDayISOString)
    .lte("timestamp", endOfDayISOString)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching time entries:", error);
    return { totalHours: 0, totalMinutes: 0, sessions: [], breaks: [] };
  }

  const sessions = [];
  const breaks = [];

  let checkInTime = null;
  let breakStartTime = null;

  for (const entry of data) {
    if (entry.action === "checkin") {
      checkInTime = new Date(entry.timestamp);
    } else if (entry.action === "checkout" && checkInTime) {
      const checkOutTime = new Date(entry.timestamp);
      // ใช้การคำนวณแบบ truncate เพื่อความแม่นยำ
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const sessionMinutes = Math.trunc(diffMs / (1000 * 60));
      sessions.push({
        start: checkInTime,
        end: checkOutTime,
        minutes: sessionMinutes,
      });
      checkInTime = null;
    } else if (entry.action === "break_start") {
      breakStartTime = new Date(entry.timestamp);
    } else if (entry.action === "break_end" && breakStartTime) {
      const breakEndTime = new Date(entry.timestamp);
      // ใช้การคำนวณแบบ truncate เพื่อความแม่นยำ
      const diffMs = breakEndTime.getTime() - breakStartTime.getTime();
      const breakMinutes = Math.trunc(diffMs / (1000 * 60));
      breaks.push({
        start: breakStartTime,
        end: breakEndTime,
        minutes: breakMinutes,
      });
      breakStartTime = null;
    }
  }

  // รวมเวลาทำงาน
  const totalSessionMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  // รวมเวลาพัก
  const totalBreakMinutes = breaks.reduce((sum, b) => sum + b.minutes, 0);
  // เวลาทำงานจริง = เวลาทำงาน - เวลาพัก
  const netMinutes = Math.max(totalSessionMinutes - totalBreakMinutes, 0);

  const totalHours = Math.floor(netMinutes / 60);
  const remainingMinutes = netMinutes % 60;

  return {
    totalHours,
    totalMinutes: remainingMinutes,
    sessions,
    breaks,
  };
}


export async function logTimeEntry(
  user_id,
  action,
  work_type,
  location
) {
  const { data, error } = await supabase
    .from("time_entries")
    .insert([{ user_id, action, work_type, location }])
    .select()
    .single();

  if (error) {
    console.error("Error logging time entry:", error);
    throw error;
  }
  return data;
}

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

  const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", user_id)
    .gte("timestamp", startOfDayUTC.toISOString())
    .lte("timestamp", endOfDayUTC.toISOString())
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching time entries:", error);
    return { totalHours: 0, totalMinutes: 0, sessions: [], breaks: [] };
  }

  let checkInTime = null;
  let checkOutTime = null;
  const breaks = [];

  let breakStartTime = null;

  for (const entry of data) {
    const entryTime = new Date(entry.timestamp);

    switch (entry.action) {
      case "checkin":
        checkInTime = entryTime;
        break;

      case "checkout":
        checkOutTime = entryTime;
        break;

      case "break_start":
        breakStartTime = entryTime;
        break;

      case "break_end":
        if (breakStartTime) {
          breaks.push({
            start: breakStartTime,
            end: entryTime,
          });
          breakStartTime = null;
        }
        break;
    }
  }

  if (!checkInTime) {
    return { totalHours: 0, totalMinutes: 0, sessions: [], breaks: [] };
  }

  const endTime = checkOutTime || now;

  // ถ้ายังพักอยู่ ให้ถือว่า end = checkout หรือ now
  if (breakStartTime) {
    breaks.push({
      start: breakStartTime,
      end: endTime,
    });
  }

  // รวมเวลาพักเฉพาะที่อยู่ในช่วง checkin ถึง checkout
  const totalBreakMinutes = breaks.reduce((sum, b) => {
    const start = b.start < checkInTime ? checkInTime : b.start;
    const end = b.end > endTime ? endTime : b.end;
    const diffMs = Math.max(0, end - start);
    return sum + Math.trunc(diffMs / 60000);
  }, 0);

  const totalWorkMinutes = Math.trunc((endTime - checkInTime) / 60000);
  const netMinutes = Math.max(totalWorkMinutes - totalBreakMinutes, 0);

  return {
    totalHours: Math.floor(netMinutes / 60),
    totalMinutes: netMinutes % 60,
    sessions: [{ start: checkInTime, end: endTime, minutes: totalWorkMinutes }],
    breaks: breaks.map((b) => ({
      start: b.start,
      end: b.end,
      minutes: Math.trunc((b.end - b.start) / 60000),
    })),
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

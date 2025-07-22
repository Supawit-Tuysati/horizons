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
    return [];
  }

  return data;
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

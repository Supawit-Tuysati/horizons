import { supabase } from '../lib/supabaseClient';

export async function getLeaveRequests(user_id) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('user_id', user_id)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching leave requests:', error);
    return [];
  }
  return data;
}

export async function requestLeave(user_id, leave_type, start_date, end_date, reason) {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{ user_id, leave_type, start_date, end_date, reason, status: 'pending' }])
    .select('*')
    .single();

  if (error) {
    console.error('Error requesting leave:', error);
    throw error;
  }
  return data;
}

export async function updateLeaveStatus(leave_id, status) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status })
    .eq('id', leave_id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating leave status:', error);
    throw error;
  }
  return data;
}

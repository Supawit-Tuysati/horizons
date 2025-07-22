import { supabase } from '../lib/supabaseClient'

export const getCompanyHolidays = async () => {
  const { data, error } = await supabase
    .from('company_holidays')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}
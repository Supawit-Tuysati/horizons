import { supabase } from "../lib/supabaseClient";

// export const getProfile = async (userId) => {
//   const { data, error } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", userId)
//     .single();

//   if (error) throw error;
//   return data;
// };

export const getProfileAndSetting = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `*,
      user_settings: user_settings (
      email_notifications,
      push_notifications,
      sms_notifications,
      worktime_reminder,
      leave_status_update,
      share_location,
      show_online_status,
      public_profile,
      auto_checkout,
      break_reminder,
      overtime_alert)`
    )
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProfileAndSetting = async (userId, profileData, settingsData) => {
  try {
    
    const { data: profileUpdated, error: profileError } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId);

    if (profileError) throw profileError;

    const { data: settingsUpdated, error: settingsError } = await supabase
      .from("user_settings")
      .update(settingsData)
      .eq("user_id", userId);

    if (settingsError) throw settingsError;

    return { profileUpdated, settingsUpdated };
  } catch (error) {
    throw error;
  }
};


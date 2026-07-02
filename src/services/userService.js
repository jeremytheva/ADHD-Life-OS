import { supabase, isSupabaseEnabled } from '../config/supabase';
import { getCurrentUserId } from './authStorage';
import {
  getUserScopedCollection,
  setUserScopedCollection
} from './storageService';

// Mock data storage
const MOCK_PREFERENCES_KEY = 'adhd_lifeos_preferences';


// Mock preferences helpers
const getUserPreferences = (userId) => getUserScopedCollection(MOCK_PREFERENCES_KEY, userId);

const setUserPreferences = (userId, prefs) => {
  setUserScopedCollection(MOCK_PREFERENCES_KEY, userId, prefs);
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return isSupabaseEnabled;
};

export const userService = {
  async getPreferences() {
    const userId = getCurrentUserId();
    if (!userId) return null;

    if (!isSupabaseConfigured()) {
      // Use mock data
      const allPrefs = getUserPreferences(userId);
      const userPrefs = allPrefs[0];
      
      // Return default preferences if none exist
      if (!userPrefs) {
        const defaultPrefs = {
          user_id: userId,
          wake_time: '07:00',
          sleep_time: '22:00',
          work_start_time: null,
          work_end_time: null,
          theme: 'low-stim',
          notifications_enabled: true,
          updated_at: new Date().toISOString()
        };
        allPrefs.push(defaultPrefs);
        setUserPreferences(userId, allPrefs);
        return defaultPrefs;
      }
      
      return userPrefs;
    }

    // Use Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {
      wake_time: '07:00',
      sleep_time: '22:00',
      work_start_time: null,
      work_end_time: null,
      theme: 'low-stim',
      notifications_enabled: true
    };
  },

  async updatePreferences(preferences) {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const updatedPrefs = {
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured()) {
      // Use mock data
      const allPrefs = getUserPreferences(userId);
      const index = allPrefs.findIndex(p => p.user_id === userId);
      
      if (index === -1) {
        allPrefs.push(updatedPrefs);
      } else {
        allPrefs[index] = { ...allPrefs[index], ...updatedPrefs };
      }
      
      setUserPreferences(userId, allPrefs);
      return allPrefs[index === -1 ? allPrefs.length - 1 : index];
    }

    // Use Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(updatedPrefs)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
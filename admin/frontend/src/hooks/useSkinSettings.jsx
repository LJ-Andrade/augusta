import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';

const SKIN_KEYS_LIGHT = [
  'skin_light_sidebar_bg',
  'skin_light_sidebar_foreground',
  'skin_light_sidebar_accent',
  'skin_light_sidebar_border',
  'skin_light_gradient_start',
  'skin_light_gradient_end',
];

const SKIN_KEYS_DARK = [
  'skin_dark_sidebar_bg',
  'skin_dark_sidebar_foreground',
  'skin_dark_sidebar_accent',
  'skin_dark_sidebar_border',
  'skin_dark_gradient_start',
  'skin_dark_gradient_end',
];

const DEFAULT_SKIN_VALUES = {
  skin_light_sidebar_bg: '#f0f0f0',
  skin_light_sidebar_foreground: '#333333',
  skin_light_sidebar_accent: '#d9d9d9',
  skin_light_sidebar_border: '#d1d5db',
  skin_light_gradient_start: '#e0e7ff',
  skin_light_gradient_end: '#f5f5f5',
  skin_dark_sidebar_bg: '#1a1a2b',
  skin_dark_sidebar_foreground: '#f5f5f5',
  skin_dark_sidebar_accent: '#1e1e2a',
  skin_dark_sidebar_border: '#1e1e2a',
  skin_dark_gradient_start: '#21214e',
  skin_dark_gradient_end: '#181835',
};

export function useSkinSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient
      .get('/system-settings')
      .then(({ data }) => {
        const skinSettings = {};
        data.data.forEach((setting) => {
          if (setting.key.startsWith('skin_')) {
            skinSettings[setting.key] = setting;
          }
        });
        setSettings(skinSettings);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const applySkinSetting = useCallback((key, value) => {
    const root = document.documentElement;
    const cssVarName = '--' + key.replace(/_/g, '-');
    root.style.setProperty(cssVarName, value);
    
    if (key.includes('gradient_start')) {
      root.style.setProperty('--gradient-start', value);
    } else if (key.includes('gradient_end')) {
      root.style.setProperty('--gradient-end', value);
    } else if (key.includes('sidebar_bg')) {
      root.style.setProperty('--sidebar', value);
    }
  }, []);

  const applySkinSettings = useCallback((skinData) => {
    const root = document.documentElement;
    Object.entries(skinData).forEach(([key, value]) => {
      const cssVarName = '--' + key.replace(/_/g, '-');
      root.style.setProperty(cssVarName, value);
    });
  }, []);

  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      const isDark = document.documentElement.classList.contains('dark');
      const keysToApply = isDark ? SKIN_KEYS_DARK : SKIN_KEYS_LIGHT;
      
      const skinData = {};
      keysToApply.forEach((key) => {
        skinData[key] = settings[key]?.value || DEFAULT_SKIN_VALUES[key] || '';
      });
      applySkinSettings(skinData);
    }
  }, [loading, settings, applySkinSettings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
    applySkinSetting(key, value);
  }, [applySkinSetting]);

  const saveSkinSettings = useCallback(async (skinData) => {
    setSaving(true);
    try {
      await axiosClient.put('/system-settings', {
        settings: skinData,
      });
      return true;
    } catch (error) {
      console.error('Error saving skin settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    const resetData = {};
    const allKeys = [...SKIN_KEYS_LIGHT, ...SKIN_KEYS_DARK];
    
    allKeys.forEach((key) => {
      resetData[key] = DEFAULT_SKIN_VALUES[key];
    });
    
    const isDark = document.documentElement.classList.contains('dark');
    const keysToApply = isDark ? SKIN_KEYS_DARK : SKIN_KEYS_LIGHT;
    keysToApply.forEach((key) => {
      applySkinSetting(key, DEFAULT_SKIN_VALUES[key]);
    });
    
    setSettings((prev) => {
      const updated = { ...prev };
      allKeys.forEach((key) => {
        if (updated[key]) {
          updated[key] = { ...updated[key], value: DEFAULT_SKIN_VALUES[key] };
        }
      });
      return updated;
    });
    
    return await saveSkinSettings(resetData);
  }, [applySkinSetting, saveSkinSettings]);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSkinSettings,
    resetToDefaults,
    defaultValues: DEFAULT_SKIN_VALUES,
  };
}

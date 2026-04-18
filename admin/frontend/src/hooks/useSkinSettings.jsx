import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';
import { useTheme } from '@/components/theme-provider';

export function useSkinSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { reloadSkinSettings } = useTheme();

  const loadSettings = useCallback(() => {
    setLoading(true);
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

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback((key, value) => {
    const cssVarName = "--" + key.replace(/_/g, "-")
    document.documentElement.style.setProperty(cssVarName, value)
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  }, []);

  const saveSkinSettings = useCallback(async (skinData) => {
    setSaving(true);
    try {
      await axiosClient.put('/system-settings', {
        settings: skinData,
      });
      reloadSkinSettings();
      return true;
    } catch (error) {
      console.error('Error saving skin settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [reloadSkinSettings]);

  const resetToDefaults = useCallback(async () => {
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

    const resetData = {};
    Object.keys(DEFAULT_SKIN_VALUES).forEach((key) => {
      resetData[key] = DEFAULT_SKIN_VALUES[key];
    });

    setSaving(true);
    try {
      await axiosClient.put('/system-settings', {
        settings: resetData,
      });
      reloadSkinSettings();
      return true;
    } catch (error) {
      console.error('Error resetting skin settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [reloadSkinSettings]);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSkinSettings,
    resetToDefaults,
    loadSettings,
  };
}

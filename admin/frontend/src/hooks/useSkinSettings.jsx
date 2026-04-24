import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';
import { useTheme } from '@/components/theme-provider';

/**
 * Reads the default skin values directly from the loaded CSS stylesheets.
 * This bypasses any inline styles set by the DB and returns the true CSS defaults.
 * Light vars are in :root, dark vars are in .dark selector.
 */
function readSkinDefaultsFromCSS() {
  const defaults = {};

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) continue;

        const selector = rule.selectorText;

        // :root → light skin vars
        // .dark → dark skin vars
        if (selector === ':root' || selector === '.dark') {
          for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i]; // e.g. "--skin-light-sidebar-bg"
            if (!prop.startsWith('--skin-')) continue;

            // "--skin-light-sidebar-bg" → "skin_light_sidebar_bg"
            const key = prop.slice(2).replace(/-/g, '_');
            const value = rule.style.getPropertyValue(prop).trim();
            if (value) defaults[key] = value;
          }
        }
      }
    } catch {
      // Skip cross-origin stylesheets
    }
  }

  return defaults;
}

export function useSkinSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const { reloadSkinSettings } = useTheme();

  const loadSettings = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/system-settings")
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

  // Read CSS defaults once on mount
  useEffect(() => {
    setDefaultValues(readSkinDefaultsFromCSS());
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback((key, value) => {
    const cssVarName = "--" + key.replace(/_/g, "-");
    document.documentElement.style.setProperty(cssVarName, value);
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
    // Read fresh defaults from the CSS at reset time
    const cssDefaults = readSkinDefaultsFromCSS();

    setSaving(true);
    try {
      await axiosClient.put('/system-settings', {
        settings: cssDefaults,
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
    defaultValues,
    updateSetting,
    saveSkinSettings,
    resetToDefaults,
    loadSettings,
  };
}

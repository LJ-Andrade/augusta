import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Palette, RotateCcw, Save, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSkinSettings } from '@/hooks/useSkinSettings';
import { useTheme } from '@/components/theme-provider';

const SKIN_FIELDS = [
  { key: 'sidebar_bg', label: 'Sidebar Background' },
  { key: 'gradient_start', label: 'Gradient Start' },
  { key: 'gradient_end', label: 'Gradient End' },
];

export default function SkinSettings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { settings, loading, saving, updateSetting, saveSkinSettings, resetToDefaults, defaultValues } = useSkinSettings();
  const [activeTheme, setActiveTheme] = useState(theme);

  useEffect(() => {
    setActiveTheme(theme);
  }, [theme]);

  const getValue = (theme, field) => {
    const key = `skin_${theme}_${field}`;
    return settings[key]?.value || defaultValues[key] || '';
  };

  const handleSave = async () => {
    const skinData = {};
    const themes = ['light', 'dark'];
    
    themes.forEach(t => {
      SKIN_FIELDS.forEach(({ key }) => {
        skinData[`skin_${t}_${key}`] = getValue(t, key);
      });
    });

    const success = await saveSkinSettings(skinData);
    if (success) {
      toast.success(t('settings.save_success'));
    } else {
      toast.error(t('common.error_occurred'));
    }
  };

  const handleReset = async () => {
    const success = await resetToDefaults();
    if (success) {
      toast.success(t('skin.reset_success'));
    } else {
      toast.error(t('common.error_occurred'));
    }
  };

  const renderColorField = (theme, fieldKey, label) => {
    const value = getValue(theme, fieldKey);
    const isNone = value === 'none';

    return (
      <div key={`${theme}-${fieldKey}`} className="flex items-center gap-4">
        <input
          type="color"
          value={isNone ? '#ffffff' : value}
          onChange={(e) => updateSetting(`skin_${theme}_${fieldKey}`, e.target.value)}
          className="h-10 w-10 rounded-full border border-input cursor-pointer"
        />
        <div className="flex-1 space-y-1">
          <Label htmlFor={`${theme}-${fieldKey}`} className="text-sm font-medium">
            {label}
          </Label>
          <input
            type="text"
            id={`${theme}-${fieldKey}`}
            value={value}
            onChange={(e) => updateSetting(`skin_${theme}_${fieldKey}`, e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="#000000"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('skin.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('skin.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => {
            setTheme('light');
            setActiveTheme('light');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTheme === 'light'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="h-4 w-4" />
          {t('skin.light_mode')}
        </button>
        <button
          onClick={() => {
            setTheme('dark');
            setActiveTheme('dark');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTheme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="h-4 w-4" />
          {t('skin.dark_mode')}
        </button>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {activeTheme === 'light' ? t('skin.light_mode') : t('skin.dark_mode')}
          </CardTitle>
          <CardDescription>
            {activeTheme === 'light' ? t('skin.light_description') : t('skin.dark_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {SKIN_FIELDS.map(({ key, label }) =>
            renderColorField(activeTheme, key, t(`skin.${key.replace('_', '_')}`) || label)
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleReset}
          disabled={saving}
          variant="outline"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('skin.reset_defaults')}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

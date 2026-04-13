import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Globe, Languages, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SystemConfigurations() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/system-settings")
      .then(({ data }) => {
        const settingsMap = {};
        data.data.forEach((setting) => {
          settingsMap[setting.key] = setting;
        });
        setSettings(settingsMap);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async (key) => {
    const setting = settings[key];
    if (!setting) return;

    setSaving(true);
    try {
      await axiosClient.put(`/system-settings/${key}`, {
        value: setting.value,
        description: setting.description,
      });
      toast.success(t("settings.save_success"));
    } catch (error) {
      toast.error(t("common.error_occurred"));
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const ensureSettingExists = async (key, defaultValue, description) => {
    if (!settings[key]) {
      try {
        await axiosClient.put(`/system-settings/${key}`, {
          value: defaultValue,
          description: description,
        });
        // Refresh settings
        const { data } = await axiosClient.get("/system-settings");
        const settingsMap = {};
        data.data.forEach((setting) => {
          settingsMap[setting.key] = setting;
        });
        setSettings(settingsMap);
      } catch (error) {
        console.error(`Error creating setting ${key}:`, error);
      }
    }
  };

  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      // Ensure required settings exist with defaults
      ensureSettingExists(
        "language_toggle_enabled",
        "true",
        "Habilitar o deshabilitar el cambio de idioma para los usuarios"
      );
      ensureSettingExists(
        "language_default_mode",
        "auto",
        "Modo de idioma por defecto: auto-detectar, español o inglés"
      );
    }
  }, [loading, settings]);

  if (loading) {
    return (
      <div className="p-8 text-center">{t("common.loading")}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("system_features.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("system_features.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle>{t("system_features.language_settings")}</CardTitle>
          </div>
          <CardDescription>
            {t("system_features.language_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Toggle */}
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="language-toggle" className="text-base">
                {t("system_features.enable_language_toggle")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("system_features.enable_language_toggle_desc")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="language-toggle"
                checked={settings.language_toggle_enabled?.value === "true"}
                onCheckedChange={(checked) => {
                  updateSetting(
                    "language_toggle_enabled",
                    "value",
                    checked ? "true" : "false"
                  );
                }}
              />
              <Button
                onClick={() => handleSave("language_toggle_enabled")}
                disabled={saving}
                size="sm"
              >
                {t("common.save")}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Language Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <Label htmlFor="language-mode" className="text-base">
                {t("system_features.language_default_mode")}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("system_features.language_default_mode_desc")}
            </p>
            <div className="flex items-center gap-3">
              <Select
                value={settings.language_default_mode?.value || "auto"}
                onValueChange={(value) => {
                  updateSetting("language_default_mode", "value", value);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue
                    placeholder={t(
                      "system_features.select_language_mode"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>{t("system_features.mode_auto")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="es">
                    <div className="flex items-center gap-2">
                      <span>🇪🇸</span>
                      <span>{t("system_features.mode_spanish")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>{t("system_features.mode_english")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleSave("language_default_mode")}
                disabled={saving}
                size="sm"
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

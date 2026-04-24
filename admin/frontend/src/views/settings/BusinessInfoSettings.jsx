import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Instagram, Linkedin, Youtube, Video, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const BUSINESS_FIELDS = [
  { key: 'business_phone', label: 'Teléfono', icon: Phone, type: 'tel', placeholder: '+54 11 1234-5678' },
  { key: 'business_email', label: 'Email', icon: Mail, type: 'email', placeholder: 'contacto@empresa.com' },
  { key: 'business_address', label: 'Dirección', icon: MapPin, type: 'text', placeholder: 'Dirección comercial' },
  { key: 'business_hours', label: 'Horarios', icon: Clock, type: 'textarea', placeholder: 'Lunes a Viernes: 9:00 - 18:00' },
  { key: 'business_whatsapp', label: 'WhatsApp', icon: MessageCircle, type: 'tel', placeholder: '+54 9 11 1234 5678' },
  { key: 'business_facebook', label: 'Facebook', icon: Facebook, type: 'url', placeholder: 'https://facebook.com/tuempresa' },
  { key: 'business_instagram', label: 'Instagram', icon: Instagram, type: 'url', placeholder: 'https://instagram.com/tuempresa' },
  { key: 'business_linkedin', label: 'LinkedIn', icon: Linkedin, type: 'url', placeholder: 'https://linkedin.com/company/tuempresa' },
  { key: 'business_youtube', label: 'YouTube', icon: Youtube, type: 'url', placeholder: 'https://youtube.com/@tuempresa' },
  { key: 'business_tiktok', label: 'TikTok', icon: Video, type: 'url', placeholder: 'https://tiktok.com/@tuempresa' },
];

export default function BusinessInfoSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient.get("/system-settings")
      .then(({ data }) => {
        const settingsMap = {};
        data.data.forEach(setting => {
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
        description: setting.description
      });
      toast.success("Guardado correctamente");
    } catch (error) {
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = BUSINESS_FIELDS.map(field => {
        const setting = settings[field.key];
        if (!setting) return null;
        return axiosClient.put(`/system-settings/${field.key}`, {
          value: setting.value,
          description: setting.description
        });
      });
      await Promise.all(promises.filter(Boolean));
      toast.success("Guardado correctamente");
    } catch (error) {
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, field, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  if (loading) {
    return <div className="p-8 text-center">{"Cargando..."}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Información de Negocio"}
        breadcrumbs={[
          { label: 'CONFIGURACIÓN' },
          { label: "Información de Negocio" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{"Datos de contacto"}</CardTitle>
          <Button onClick={handleSaveAll} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {"Guardar Cambios"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {BUSINESS_FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <Label htmlFor={field.key} className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" />
                    {field.label}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={settings[field.key]?.value || ''}
                      onChange={(e) => updateSetting(field.key, 'value', e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={settings[field.key]?.value || ''}
                      onChange={(e) => updateSetting(field.key, 'value', e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

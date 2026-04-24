import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Save, Loader2 } from "lucide-react";
export default function SettingsList() {
	const [settings, setSettings] = useState({});
	const [originalSettings, setOriginalSettings] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const keysToSave = ['site_url', 'mail_to_address', 'business_name'];
	const hasChanges = keysToSave.some(key => 
		settings[key]?.value !== originalSettings[key]?.value
	);

	useEffect(() => {
		axiosClient.get("/system-settings")
			.then(({ data }) => {
				const settingsMap = {};
				data.data.forEach(setting => {
					settingsMap[setting.key] = setting;
				});
				setSettings(settingsMap);
				setOriginalSettings(settingsMap);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

	const handleSave = async () => {
		setSaving(true);
		try {
			for (const key of keysToSave) {
				if (settings[key]?.value !== originalSettings[key]?.value) {
					await axiosClient.put(`/system-settings/${key}`, {
						value: settings[key].value,
						description: settings[key].description
					});
				}
			}
			setOriginalSettings(settings);
			toast.success("Configuración guardada correctamente");
		} catch (error) {
			toast.error("Ocurrió un error");
		} finally {
			setSaving(false);
		}
	};

	const updateSetting = (key, value) => {
		setSettings(prev => ({
			...prev,
			[key]: { ...prev[key], value }
		}));
	};

	if (loading) {
		return <div className="p-8 text-center">{"Cargando..."}</div>;
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Configuración del Sistema"}
				breadcrumbs={[
					{ label: 'CONFIGURACIÓN' },
					{ label: "Sistema" },
				]}
			/>

			<Card>
				<form id="settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>{"Parámetros del Sistema"}</CardTitle>
						<Button
							type="submit"
							form="settings-form"
							disabled={saving || !hasChanges}
						>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{"Guardando..."}
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									{"Guardar"}
								</>
							)}
						</Button>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-2">
							<Label htmlFor="site_url">{"URL del Sitio"}</Label>
							<Input
								id="site_url"
								type="url"
								value={settings.site_url?.value || ''}
								onChange={(e) => updateSetting('site_url', e.target.value)}
								placeholder="https://example.com"
							/>
							<p className="text-sm text-muted-foreground">
								{"URL base del catálogo público de productos (ej: https://mitienda.com)"}
							</p>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="mail_to_address">{"Email de destino (Contacto)"}</Label>
							<Input
								id="mail_to_address"
								type="email"
								value={settings.mail_to_address?.value || ''}
								onChange={(e) => updateSetting('mail_to_address', e.target.value)}
								placeholder="destino@empresa.com"
							/>
							<p className="text-sm text-muted-foreground">
								{"Email donde se recibirán los mensajes del formulario de contacto"}
							</p>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="business_name">{"Nombre del Negocio"}</Label>
							<Input
								id="business_name"
								type="text"
								value={settings.business_name?.value || ''}
								onChange={(e) => updateSetting('business_name', e.target.value)}
								placeholder="Nombre de tu negocio"
							/>
							<p className="text-sm text-muted-foreground">
								{"Nombre que se mostrará en el sidebar del administrador"}
							</p>
						</div>

					</CardContent>
				</form>
			</Card>
		</div>
	);
}

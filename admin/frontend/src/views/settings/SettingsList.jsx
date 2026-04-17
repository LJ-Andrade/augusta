import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function SettingsList() {
	const { t } = useTranslation();
	const [settings, setSettings] = useState({});
	const [originalSettings, setOriginalSettings] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const keysToSave = ['site_url', 'mail_to_address', 'business_name'];
	const hasChanges = keysToSave.some(key => 
		settings[key]?.value !== originalSettings[key]?.value
	);

	useEffect(() => {
		axiosClient.get('/system-settings')
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
			toast.success(t('settings.save_success'));
		} catch (error) {
			toast.error(t('common.error_occurred'));
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
		return <div className="p-8 text-center">{t('common.loading')}</div>;
	}

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>

			<Card className="pt-6">
				<form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<CardContent className="space-y-6">
						<div className="grid gap-2">
							<Label htmlFor="site_url">{t('settings.site_url')}</Label>
							<Input
								id="site_url"
								type="url"
								value={settings.site_url?.value || ''}
								onChange={(e) => updateSetting('site_url', e.target.value)}
								placeholder="https://example.com"
							/>
							<p className="text-sm text-muted-foreground">
								{t('settings.site_url_description')}
							</p>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="mail_to_address">{t('settings.mail_to_address')}</Label>
							<Input
								id="mail_to_address"
								type="email"
								value={settings.mail_to_address?.value || ''}
								onChange={(e) => updateSetting('mail_to_address', e.target.value)}
								placeholder="destino@empresa.com"
							/>
							<p className="text-sm text-muted-foreground">
								{t('settings.mail_to_address_description')}
							</p>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="business_name">{t('settings.business_name')}</Label>
							<Input
								id="business_name"
								type="text"
								value={settings.business_name?.value || ''}
								onChange={(e) => updateSetting('business_name', e.target.value)}
								placeholder="Nombre de tu negocio"
							/>
							<p className="text-sm text-muted-foreground">
								{t('settings.business_name_description')}
							</p>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={saving || !hasChanges}
							>
								{saving ? t('common.saving') : t('common.save')}
							</Button>
						</div>
					</CardContent>
				</form>
			</Card>
		</div>
	);
}

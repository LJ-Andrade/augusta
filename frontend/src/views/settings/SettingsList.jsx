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
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		axiosClient.get('/system-settings')
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
			toast.success(t('settings.save_success'));
		} catch (error) {
			toast.error(t('common.error_occurred'));
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
		return <div className="p-8 text-center">{t('common.loading')}</div>;
	}

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>

			<Card className="pt-6">

				<CardContent className="space-y-6">
					<div className="grid gap-2">
						<Label htmlFor="site_url">{t('settings.site_url')}</Label>
						<div className="flex gap-2">
							<Input
								id="site_url"
								type="url"
								value={settings.site_url?.value || ''}
								onChange={(e) => updateSetting('site_url', 'value', e.target.value)}
								placeholder="https://example.com"
							/>
							<Button
								onClick={() => handleSave('site_url')}
								disabled={saving}
							>
								{t('common.save')}
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							{t('settings.site_url_description')}
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="mail_to_address">{t('settings.mail_to_address')}</Label>
						<div className="flex gap-2">
							<Input
								id="mail_to_address"
								type="email"
								value={settings.mail_to_address?.value || ''}
								onChange={(e) => updateSetting('mail_to_address', 'value', e.target.value)}
								placeholder="destino@empresa.com"
							/>
							<Button
								onClick={() => handleSave('mail_to_address')}
								disabled={saving}
							>
								{t('common.save')}
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							{t('settings.mail_to_address_description')}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

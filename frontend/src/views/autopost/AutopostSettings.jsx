import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Key, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

export default function AutopostSettings() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [users, setUsers] = useState([]);

	const formSchema = z.object({
		gemini_api_key: z.string().optional(),
		pre_prompt: z.string().min(1000, "El pre-prompt debe tener al menos 1000 caracteres"),
		model: z.string().default("gemini-2.5-flash"),
		author_id: z.string().optional(),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			gemini_api_key: "",
			pre_prompt: "",
			model: "gemini-2.5-flash",
			author_id: "",
		},
	});

	useEffect(() => {
		Promise.all([
			axiosClient.get("autopost/settings"),
			axiosClient.get("users").catch(() => ({ data: { data: [] } }))
		])
			.then(([settingsRes, usersRes]) => {
				setUsers(usersRes.data?.data || []);
				const data = settingsRes.data;
				console.log('Settings loaded:', data);
				const newValues = {
					gemini_api_key: data.has_api_key ? "••••••••••••" : "",
					pre_prompt: data.pre_prompt || "",
					model: data.model || "gemini-2.5-flash",
					author_id: data.author_id?.toString() || "",
				};
				form.reset(newValues);
				setFetching(false);
			})
			.catch((err) => {
				console.error('Error loading settings:', err);
				setFetching(false);
			});
	}, [form]);

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const payload = {
				pre_prompt: data.pre_prompt,
				model: data.model,
				author_id: data.author_id ? parseInt(data.author_id) : null,
			};

			const isNewKey = data.gemini_api_key &&
				data.gemini_api_key.trim() !== "" &&
				!data.gemini_api_key.startsWith("••");

			if (isNewKey) {
				payload.gemini_api_key = data.gemini_api_key.trim();
			}

			console.log('Sending payload:', payload);

			await axiosClient.put("autopost/settings", payload);
			toast.success(t('autopost.settings_saved') || "Configuración guardada correctamente");

			if (isNewKey) {
				form.setValue("gemini_api_key", "••••••••••••");
			}
		} catch (error) {
			console.error('Error saving settings:', error.response?.data);
			toast.error(error.response?.data?.error || "Error al guardar configuración");
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">{t('autopost.settings_title') || "Configuración de AutoBlog"}</h1>
				<p className="text-muted-foreground mt-2">
					{t('autopost.settings_description') || "Configura la API de Gemini y el pre-prompt para generar artículos automáticamente."}
				</p>
			</div>

			<Separator />

			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						{t('autopost.api_config') || "Configuración de API"}
					</CardTitle>
					<CardDescription>
						{t('autopost.api_description') || "Ingresa tu API key de Google Gemini."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="gemini_api_key"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('autopost.gemini_api_key') || "API Key de Gemini"}</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder={t('autopost.api_key_placeholder') || "Ingresa tu API key..."}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="model"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('autopost.model') || "Modelo"}</FormLabel>
										<FormControl>
											<Input
												placeholder="gemini-2.5-flash"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="author_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('autopost.default_author') || "Autor por Defecto"}</FormLabel>
										<FormControl>
											<select
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												{...field}
											>
												<option value="">Selecciona un autor...</option>
												{users.map((user) => (
													<option key={user.id} value={user.id}>
														{user.name}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator />

							<FormField
								control={form.control}
								name="pre_prompt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('autopost.pre_prompt') || "Pre-prompt"}</FormLabel>
										<FormControl>
											<textarea
												className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder={t('autopost.pre_prompt_placeholder') || "Instrucciones para la IA..."}
												{...field}
											/>
										</FormControl>
										<div className="flex justify-between items-center mt-1">
											<FormMessage />
											<span className={`text-xs ${(field.value?.length || 0) >= 1000 ? 'text-green-500' : 'text-muted-foreground'}`}>
												{field.value?.length || 0} / 1000 caracteres mínimos
											</span>
										</div>
										<p className="text-sm text-muted-foreground mt-1">
											{t('autopost.pre_prompt_help') || "Este texto se combinará con el tema para generar el artículo."}
										</p>
									</FormItem>
								)}
							/>

							<Button type="submit" disabled={loading} className="w-full">
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t('common.saving') || "Guardando..."}
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										{t('common.save') || "Guardar"}
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

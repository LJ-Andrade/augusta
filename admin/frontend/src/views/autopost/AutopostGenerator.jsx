import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, Save, FileText, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

export default function AutopostGenerator() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [hasApiKey, setHasApiKey] = useState(null);
	const [generated, setGenerated] = useState(false);

	const topicFormSchema = z.object({
		topic: z.string().min(5, "El tema debe tener al menos 5 caracteres"),
	});

	const topicForm = useForm({
		resolver: zodResolver(topicFormSchema),
		defaultValues: {
			topic: "",
		},
	});

	const contentFormSchema = z.object({
		title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
		content: z.string().min(20, "El contenido debe tener al menos 20 caracteres"),
		category_name: z.string().optional(),
		tags: z.string().optional(),
	});

	const contentForm = useForm({
		resolver: zodResolver(contentFormSchema),
		defaultValues: {
			title: "",
			content: "",
			category_name: "",
			tags: "",
		},
	});

	useEffect(() => {
		axiosClient
			.get("autopost/settings")
			.then(({ data }) => {
				setHasApiKey(data.has_api_key || false);
			})
			.catch(() => {
				setHasApiKey(false);
			});
	}, []);

	const handleGenerate = async (data) => {
		setGenerating(true);
		setGenerated(false);
		try {
			const { data: response } = await axiosClient.post("autopost/generate", {
				topic: data.topic,
			});

			contentForm.reset({
				title: response.title,
				content: response.content,
				category_name: response.category || "",
				tags: Array.isArray(response.tags) ? response.tags.join(", ") : "",
			});
			setGenerated(true);
			toast.success(t('autopost.generated_success') || "Contenido generado correctamente");
		} catch (error) {
			const errorMsg = error.response?.data?.error || "Error al generar contenido";
			toast.error(errorMsg);
			console.error("Generation error:", error.response?.data);
		} finally {
			setGenerating(false);
		}
	};

	const handleSave = async (status) => {
		setLoading(true);
		try {
			const data = contentForm.getValues();
			const tagsArray = data.tags
				? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
				: [];

			await axiosClient.post("autopost/store", {
				title: data.title,
				content: data.content,
				category_name: data.category_name,
				tags: tagsArray,
				status: status,
			});

			toast.success(t('autopost.saved_success') || `Artículo guardado como ${status}`);
			navigate("/articles");
		} catch (error) {
			toast.error(error.response?.data?.error || "Error al guardar artículo");
		} finally {
			setLoading(false);
		}
	};

	if (hasApiKey === null) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!hasApiKey) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">{t('autopost.title') || "AutoBlog - Generador de Artículos"}</h1>
					<p className="text-muted-foreground mt-2">
						{t('autopost.description') || "Genera artículos automáticamente usando IA."}
					</p>
				</div>

				<Card className="max-w-2xl border-yellow-500/50 bg-yellow-500/10">
					<CardContent className="pt-6">
						<div className="flex items-start gap-4">
							<AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5" />
							<div>
								<h3 className="font-semibold text-yellow-500">{t('autopost.api_not_configured') || "API no configurada"}</h3>
								<p className="text-sm text-muted-foreground mt-1">
									{t('autopost.api_not_configured_desc') || "Debes configurar tu API key de Gemini antes de usar el generador."}
								</p>
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => navigate("/autopost-settings")}
								>
									{t('autopost.go_to_settings') || "Ir a configuración"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">{t('autopost.title') || "AutoBlog - Generador de Artículos"}</h1>
				<p className="text-muted-foreground mt-2">
					{t('autopost.description') || "Genera artículos automáticamente usando IA."}
				</p>
			</div>

			<Separator />

			{!generated ? (
				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5" />
							{t('autopost.generate_title') || "Generar Artículo"}
						</CardTitle>
						<CardDescription>
							{t('autopost.generate_description') || "Ingresa un tema o palabras clave para que la IA genere un artículo."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...topicForm}>
							<form onSubmit={topicForm.handleSubmit(handleGenerate)} className="space-y-4">
								<FormField
									control={topicForm.control}
									name="topic"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('autopost.topic') || "Tema del artículo"}</FormLabel>
											<FormControl>
												<Textarea
													placeholder={t('autopost.topic_placeholder') || "Ej: Razones para tener una web para tu empresa..."}
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" disabled={generating} className="w-full">
									{generating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t('autopost.generating') || "Generando..."}
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-4 w-4" />
											{t('autopost.generate_button') || "Generar con IA"}
										</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								{t('autopost.preview_title') || "Vista Previa"}
							</CardTitle>
							<CardDescription>
								{t('autopost.preview_description') || "Edita el contenido generado antes de guardar."}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Form {...contentForm}>
								<div className="space-y-4">
									<FormField
										control={contentForm.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t('articles.title') || "Título"}</FormLabel>
												<FormControl>
													<Input placeholder="Título del artículo" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={contentForm.control}
											name="category_name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t('articles.category') || "Categoría"}</FormLabel>
													<FormControl>
														<Input placeholder="Ej: Tecnología" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={contentForm.control}
											name="tags"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t('articles.tags') || "Etiquetas (separadas por coma)"}</FormLabel>
													<FormControl>
														<Input placeholder="Ej: IA, Software, Cloud" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={contentForm.control}
										name="content"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t('articles.content') || "Contenido"}</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Contenido del artículo..."
														className="min-h-[300px] font-mono text-sm"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</Form>
						</CardContent>
					</Card>

					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={() => handleSave("draft")}
							disabled={loading}
							className="flex-1"
						>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							{t('autopost.save_draft') || "Guardar como Borrador"}
						</Button>
						<Button
							onClick={() => handleSave("published")}
							disabled={loading}
							className="flex-1"
						>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Sparkles className="mr-2 h-4 w-4" />
							)}
							{t('autopost.publish') || "Publicar"}
						</Button>
					</div>

					<Button
						variant="ghost"
						onClick={() => {
							setGenerated(false);
							topicForm.reset();
						}}
						className="w-full"
					>
						{t('autopost.generate_another') || "Generar otro artículo"}
					</Button>
				</div>
			)}
		</div>
	);
}

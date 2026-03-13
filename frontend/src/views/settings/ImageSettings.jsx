import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Image, Save, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

const ALL_SECTIONS = [
	{ value: 'blog_cover', label: 'Imagen de portada', section: 'blog' },
	{ value: 'blog_gallery', label: 'Galería de imágenes', section: 'blog' },
	{ value: 'product_cover', label: 'Imagen de portada', section: 'products' },
	{ value: 'product_gallery', label: 'Galería de imágenes', section: 'products' },
];

const ASPECT_RATIOS = [
	{ value: '', label: 'Sin restricción' },
	{ value: '1:1', label: '1:1 (Cuadrado)' },
	{ value: '4:3', label: '4:3' },
	{ value: '16:9', label: '16:9 (Panorámico)' },
	{ value: '3:2', label: '3:2' },
	{ value: '21:9', label: '21:9 (Ultra panorámico)' },
];

const MAX_SIZES = [
	{ value: 512, label: '512 KB' },
	{ value: 1024, label: '1 MB' },
	{ value: 1536, label: '1.5 MB' },
	{ value: 2048, label: '2 MB' },
	{ value: 3072, label: '3 MB' },
	{ value: 4096, label: '4 MB' },
	{ value: 5120, label: '5 MB' },
	{ value: 10240, label: '10 MB' },
];

export default function ImageSettings() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [settings, setSettings] = useState({});
	
	const sectionParam = searchParams.get('section');
	const currentSection = sectionParam === 'products' ? 'products' : 'blog';
	const SECTION_TYPES = ALL_SECTIONS.filter(s => s.section === currentSection);
	
	const defaultSection = sectionParam === 'products' ? 'product_cover' : 'blog_cover';
	const [selectedSection, setSelectedSection] = useState(defaultSection);

	const formSchema = z.object({
		name: z.string().min(1, "El nombre es requerido"),
		max_size_kb: z.coerce.number().min(1).max(10240),
		allowed_extensions: z.string().min(1, "Las extensiones son requeridas"),
		min_width: z.coerce.number().nullable(),
		min_height: z.coerce.number().nullable(),
		max_width: z.coerce.number().nullable(),
		max_height: z.coerce.number().nullable(),
		aspect_ratio: z.string().nullable(),
		active: z.boolean(),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			max_size_kb: 2048,
			allowed_extensions: "jpg,jpeg,png,webp",
			min_width: null,
			min_height: null,
			max_width: null,
			max_height: null,
			aspect_ratio: null,
			active: true,
		},
	});

	useEffect(() => {
		axiosClient.get("/image-settings")
			.then(({ data }) => {
				const settingsMap = {};
				data.data.forEach((item) => {
					settingsMap[item.section] = item;
				});
				setSettings(settingsMap);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		const sectionData = settings[selectedSection];
		if (sectionData) {
			form.reset({
				name: sectionData.name || "",
				max_size_kb: sectionData.max_size_kb || 2048,
				allowed_extensions: sectionData.allowed_extensions || "jpg,jpeg,png,webp",
				min_width: sectionData.min_width || null,
				min_height: sectionData.min_height || null,
				max_width: sectionData.max_width || null,
				max_height: sectionData.max_height || null,
				aspect_ratio: sectionData.aspect_ratio || null,
				active: sectionData.active !== false,
			});
		} else {
			form.reset({
				name: SECTION_TYPES.find(s => s.value === selectedSection)?.label || "",
				max_size_kb: 2048,
				allowed_extensions: "jpg,jpeg,png,webp",
				min_width: null,
				min_height: null,
				max_width: null,
				max_height: null,
				aspect_ratio: null,
				active: true,
			});
		}
	}, [selectedSection, settings, form]);

	const onSubmit = async (data) => {
		setSaving(true);
		try {
			const payload = {
				...data,
				section: selectedSection,
			};

			if (settings[selectedSection]?.id) {
				await axiosClient.put(`/image-settings/${settings[selectedSection].id}`, payload);
			} else {
				await axiosClient.post("/image-settings", payload);
			}

			const { data: newData } = await axiosClient.get("/image-settings");
			const settingsMap = {};
			newData.data.forEach((item) => {
				settingsMap[item.section] = item;
			});
			setSettings(settingsMap);

			toast.success(t('image_settings.save_success') || "Configuración guardada correctamente");
		} catch (error) {
			toast.error(error.response?.data?.message || "Error al guardar");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">
					{currentSection === 'products' 
						? (t('image_settings.title_products') || "Configuración de Imágenes de Productos")
						: (t('image_settings.title_blog') || "Configuración de Imágenes del Blog")
					}
				</h1>
				<p className="text-muted-foreground mt-2">
					{t('image_settings.description') || "Configura los parámetros de validación para las imágenes."}
				</p>
			</div>

			<Separator />

			<div className="border-b border-border">
				<nav className="flex gap-1 -mb-px">
					{SECTION_TYPES.map((section) => (
						<button
							key={section.value}
							onClick={() => setSelectedSection(section.value)}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
								selectedSection === section.value
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
							}`}
						>
							<Image className="h-4 w-4" />
							{section.label}
						</button>
					))}
				</nav>
			</div>

			<div className="flex-1">
				<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Image className="h-5 w-5" />
								{t('image_settings.config') || "Configuración"}: {SECTION_TYPES.find(s => s.value === selectedSection)?.label}
							</CardTitle>
							<CardDescription>
								{t('image_settings.config_description') || "Parámetros de validación para esta sección"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="max_size_kb"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('image_settings.max_size') || "Tamaño máximo"}
													</FormLabel>
													<FormControl>
														<select
															className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
															value={field.value}
															onChange={(e) => field.onChange(parseInt(e.target.value))}
														>
															{MAX_SIZES.map((size) => (
																<option key={size.value} value={size.value}>
																	{size.label}
																</option>
															))}
														</select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="allowed_extensions"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('image_settings.extensions') || "Extensiones permitidas"}
													</FormLabel>
													<FormControl>
														<Input placeholder="jpg,jpeg,png,webp" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<Separator />

									<div>
										<h3 className="text-sm font-medium mb-4">
											{t('image_settings.dimensions') || "Restricciones de dimensiones"}
										</h3>
										<div className="grid grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="min_width"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t('image_settings.min_width') || "Ancho mínimo (px)"}</FormLabel>
														<FormControl>
															<Input 
																type="number" 
																placeholder="Sin límite"
																value={field.value ?? ''}
																onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="min_height"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t('image_settings.min_height') || "Alto mínimo (px)"}</FormLabel>
														<FormControl>
															<Input 
																type="number" 
																placeholder="Sin límite"
																value={field.value ?? ''}
																onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="max_width"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t('image_settings.max_width') || "Ancho máximo (px)"}</FormLabel>
														<FormControl>
															<Input 
																type="number" 
																placeholder="Sin límite"
																value={field.value ?? ''}
																onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="max_height"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t('image_settings.max_height') || "Alto máximo (px)"}</FormLabel>
														<FormControl>
															<Input 
																type="number" 
																placeholder="Sin límite"
																value={field.value ?? ''}
																onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="mt-4">
											<FormField
												control={form.control}
												name="aspect_ratio"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t('image_settings.aspect_ratio') || "Aspect ratio"}</FormLabel>
														<FormControl>
															<select
																className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
																value={field.value ?? ''}
																onChange={(e) => field.onChange(e.target.value || null)}
															>
																{ASPECT_RATIOS.map((ratio) => (
																	<option key={ratio.value} value={ratio.value}>
																		{ratio.label}
																	</option>
																))}
															</select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									<Separator />

									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											id="active"
											className="h-4 w-4 rounded border-gray-300"
											checked={form.watch("active")}
											onChange={(e) => form.setValue("active", e.target.checked)}
										/>
										<Label htmlFor="active" className="cursor-pointer">
											{t('image_settings.active') || "Activar validaciones"}
										</Label>
									</div>

									<Button type="submit" disabled={saving} className="w-full">
										{saving ? (
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
		</div>
	);
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTranslation } from "react-i18next";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageGallery } from "@/components/ui/image-gallery";
import { PageHeader } from "@/components/page-header";

export default function ArticleForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [entityName, setEntityName] = useState("");
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [coverUrl, setCoverUrl] = useState(null);
	const [pendingCover, setPendingCover] = useState(null);
	const [gallery, setGallery] = useState([]);

	const formSchema = z.object({
		title: z.string().min(3, t('articles.validation.title_min')),
		slug: z.string().nullable(),
		category_id: z.string().min(1, t('articles.validation.category_required')),
		tag_ids: z.array(z.number()).default([]),
		status: z.enum(["draft", "published", "archived"]),
		content: z.string().min(10, t('articles.validation.content_min')),
		order: z.number().optional(),
		featured: z.boolean().default(false),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			slug: "",
			category_id: "",
			tag_ids: [],
			status: "draft",
			content: "",
			order: 0,
			featured: false,
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [catsRes, tagsRes] = await Promise.all([
					axiosClient.get("categories?all=1"),
					axiosClient.get("tags?all=1")
				]);
				setCategories(catsRes.data.data || []);
				setTags(tagsRes.data.data || []);
			} catch (err) {
				console.error("Error fetching form data:", err);
			}
		};

		fetchData();

		if (id) {
			axiosClient
				.get(`articles/${id}`)
				.then(({ data }) => {
					form.reset({
						title: data.data.title,
						slug: data.data.slug || "",
						category_id: data.data.category_id?.toString() || "",
						tag_ids: data.data.tags?.map(tag => tag.id) || [],
						status: data.data.status,
						content: data.data.content,
						order: data.data.order || 0,
						featured: data.data.featured || false,
					});
					setEntityName(data.data.title);
					setCoverUrl(data.data.cover_url);
					setGallery(data.data.gallery || []);
				});
		}
	}, [id, form]);

	const handleCoverChange = (file) => {
		setPendingCover(file);
		if (file) {
			setCoverUrl(URL.createObjectURL(file));
		} else {
			setCoverUrl(null);
		}
	};

	const handleRemoveGalleryImage = async (mediaId) => {
		try {
			await axiosClient.delete(`articles/${id}/gallery/${mediaId}`);
			setGallery(prev => prev.filter(img => img.id !== mediaId));
			toast.success(t('articles.image_deleted'));
		} catch {
			toast.error(t('common.error_occurred'));
		}
	};

	const onSubmit = (values) => {
		setLoading(true);

		const formData = new FormData();
		Object.keys(values).forEach((key) => {
			if (key === 'tag_ids') {
				values[key].forEach((tagId) => formData.append('tag_ids[]', tagId));
			} else if (key === 'featured') {
				formData.append(key, values[key] ? '1' : '0');
			} else if (typeof values[key] === 'boolean') {
				formData.append(key, values[key] ? '1' : '0');
			} else if (values[key] !== null && values[key] !== undefined) {
				formData.append(key, values[key]);
			}
		});

		if (!formData.has('featured')) {
			formData.append('featured', '0');
		}

		if (pendingCover) {
			formData.append("cover", pendingCover);
		}

		const newGalleryImages = gallery.filter(img => img.file);
		newGalleryImages.forEach((img) => {
			formData.append("gallery[]", img.file);
		});

		if (id) {
			formData.append("_method", "PUT");
		}

		const request = id
			? axiosClient.post(`articles/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			: axiosClient.post("articles", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

		request
			.then(() => {
				toast.success(id ? t('articles.update_success') : t('articles.create_success'));
				navigate("/articles");
			})
			.catch((error) => {
				if (error.response && error.response.status === 422) {
					const errors = error.response.data.errors;
					Object.keys(errors).forEach((key) => {
						form.setError(key, {
							type: "manual",
							message: errors[key][0],
						});
					});
				} else {
					toast.error(t('common.error_occurred'))
				}
				setLoading(false);
			});
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title={
					id
						? `${t('articles.editing') || 'Editando artículo'} "${entityName}"`
						: t('articles.create_title')
				}
				breadcrumbs={[
					{ label: 'BLOG' },
					{ label: t('articles.title') || 'Artículos', href: '/articles' },
					{ label: id ? t('common.edit') : t('common.create') },
				]}
			/>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>{t('articles.title')}, {t('articles.category')} & {t('articles.tags')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('articles.title')}</FormLabel>
											<FormControl>
												<Input
													placeholder={t('articles.title_placeholder')}
													className="bg-muted/30 focus-visible:ring-primary"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="slug"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Slug</FormLabel>
											<FormControl>
												<Input 
													placeholder="Slug (auto-generated on create)" 
													value={field.value || ''}
													{...field} 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="category_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('articles.category')}</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
													{...field}
												>
													<option value="">{t('articles.select_category')}</option>
													{categories.map((cat) => (
														<option key={cat.id} value={cat.id}>
															{cat.name}
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
									name="tag_ids"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('articles.tags')}</FormLabel>
											<FormControl>
												<MultiSelect
													value={field.value || []}
													onValueChange={field.onChange}
													options={tags}
													placeholder={t('articles.select_tags')}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<RichTextEditor
												value={field.value}
												onChange={field.onChange}
												placeholder={t('articles.content_placeholder')}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Imágenes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="md:col-span-1">
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
										{t('articles.cover')}
									</label>
									<ImageUpload
										value={coverUrl}
										onChange={handleCoverChange}
										aspect={16 / 9}
									/>
								</div>
								<div className="md:col-span-2">
									<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
										{t('articles.gallery')}
									</label>
									<ImageGallery
										value={gallery}
										onChange={setGallery}
										onRemoveExisting={id ? handleRemoveGalleryImage : undefined}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('articles.status')}</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
													{...field}
												>
													<option value="draft">{t('articles.status_draft')}</option>
													<option value="published">{t('articles.status_published')}</option>
													<option value="archived">{t('articles.status_archived')}</option>
												</select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="order"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('articles.order')}</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="0"
													value={field.value ?? 0}
													onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
													className="bg-muted/30 focus-visible:ring-primary"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="featured"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-8">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-sm font-medium">
													{t('articles.featured')}
												</FormLabel>
											</div>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					<div className="flex gap-2 justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate("/articles")}
						>
							<X className="mr-2 h-4 w-4" />
							{t('common.cancel')}
						</Button>
						<Button type="submit" disabled={loading} className="w-40 bg-primary hover:bg-primary/90">
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<Save className="mr-2 h-4 w-4" />
							{id ? t('articles.update_button') : t('articles.create_button')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

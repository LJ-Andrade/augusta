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
import { useTranslation } from "react-i18next";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageGallery } from "@/components/ui/image-gallery";
import { MultiSelect } from "@/components/ui/multi-select";
import { PageHeader } from "@/components/page-header";

export default function ProductForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [categories, setCategories] = useState([]);
	const [subcategories, setSubcategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [sizes, setSizes] = useState([]);
	const [coverUrl, setCoverUrl] = useState(null);
	const [pendingCover, setPendingCover] = useState(null);
	const [gallery, setGallery] = useState([]);
	const [documentUrl, setDocumentUrl] = useState(null);
	const [pendingDocument, setPendingDocument] = useState(null);
	const [productName, setProductName] = useState("");

	const formSchema = z.object({
		name: z.string().min(3, t('products.validation.name_min')),
		slug: z.string().nullable(),
		description: z.string().nullable(),
		cost_price: z.string().min(1, t('products.validation.cost_price_required')),
		sale_price: z.string().min(1, t('products.validation.sale_price_required')),
		category_id: z.string().nullable(),
		subcategory_id: z.string().nullable(),
		tag_ids: z.array(z.number()).default([]),
		size_ids: z.array(z.number()).default([]),
		status: z.enum(["draft", "published", "archived"]),
		order: z.number().optional(),
		featured: z.boolean().default(false),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			cost_price: "",
			sale_price: "",
			category_id: "",
			subcategory_id: "",
			tag_ids: [],
			size_ids: [],
			status: "draft",
			order: 0,
			featured: false,
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [catsRes, tagsRes, sizesRes] = await Promise.all([
					axiosClient.get("product-categories?all=1"),
					axiosClient.get("product-tags?all=1"),
					axiosClient.get("product-sizes?all=1")
				]);
				setCategories(catsRes.data.data || []);
				setTags(tagsRes.data.data || []);
				setSizes(sizesRes.data.data || []);
			} catch (error) {
				console.error("Error fetching form data:", error);
			}
		};

		fetchData();

		if (id) {
			setFetching(true);
			axiosClient
				.get(`products/${id}`)
				.then(({ data }) => {
					form.reset({
						name: data.data.name,
						slug: data.data.slug || "",
						description: data.data.description || "",
						cost_price: data.data.cost_price?.toString() || "",
						sale_price: data.data.sale_price?.toString() || "",
						category_id: data.data.category_id?.toString() || "",
						subcategory_id: data.data.subcategory_id?.toString() || "",
						tag_ids: data.data.tags?.map(tag => tag.id) || [],
						size_ids: data.data.sizes?.map(size => size.id) || [],
						status: data.data.status,
						order: data.data.order || 0,
						featured: data.data.featured || false,
					});
					if (data.data.category_id) {
						axiosClient.get(`product-categories?parent=${data.data.category_id}`).then(res => {
							setSubcategories(res.data.data || []);
						});
					}
					setCoverUrl(data.data.cover_url);
					setGallery(data.data.gallery || []);
					setDocumentUrl(data.data.document_url);
					setProductName(data.data.name);
					setFetching(false);
				})
				.catch(() => {
					setFetching(false);
				});
		}
	}, [id, form]);

	useEffect(() => {
		const categoryId = form.watch('category_id');
		if (categoryId) {
			axiosClient.get(`product-categories?parent=${categoryId}`).then(res => {
				setSubcategories(res.data.data || []);
			});
			if (form.getValues('subcategory_id')) {
				form.setValue('subcategory_id', '');
			}
		} else {
			setSubcategories([]);
		}
	}, [form.watch('category_id')]);

	const handleCoverChange = (file) => {
		setPendingCover(file);
		if (file) {
			setCoverUrl(URL.createObjectURL(file));
		} else {
			setCoverUrl(null);
		}
	};

	const handleDocumentChange = (file) => {
		setPendingDocument(file);
		if (file) {
			setDocumentUrl(URL.createObjectURL(file));
		} else {
			setDocumentUrl(null);
		}
	};

	const handleRemoveGalleryImage = async (mediaId) => {
		try {
			await axiosClient.delete(`products/${id}/gallery/${mediaId}`);
			setGallery(prev => prev.filter(img => img.id !== mediaId));
			toast.success(t('products.image_deleted'));
		} catch (error) {
			toast.error(t('common.error_occurred'));
		}
	};

	const onSubmit = (values) => {
		setLoading(true);

		const formData = new FormData();
		Object.keys(values).forEach((key) => {
			if (key === 'tag_ids') {
				values[key].forEach((tagId) => formData.append('tag_ids[]', tagId));
			} else if (key === 'size_ids') {
				values[key].forEach((sizeId) => formData.append('size_ids[]', sizeId));
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

		if (pendingDocument) {
			formData.append("document", pendingDocument);
		}

		if (id) {
			formData.append("_method", "PUT");
		}

		const request = id
			? axiosClient.post(`products/${id}`, formData)
			: axiosClient.post("products", formData);

		request
			.then(() => {
				toast.success(id ? t('products.update_success') : t('products.create_success'));
				navigate("/products");
			})
			.catch((error) => {
				if (error.response?.data?.errors) {
					Object.entries(error.response.data.errors).forEach(([key, messages]) => {
						form.setError(key, { message: messages[0] });
					});
				}
				toast.error(t('common.error_occurred'));
			})
			.finally(() => {
				setLoading(false);
			});
	};

	if (fetching) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{id ? (
				<PageHeader
					title={`Editando producto "${productName}"`}
					breadcrumbs={[
						{ label: t('products.title'), href: "/products" },
						{ label: t('common.edit') },
					]}
				/>
			) : (
				<PageHeader
					title={t('products.create_title')}
					breadcrumbs={[
						{ label: t('products.title'), href: "/products" },
						{ label: t('common.create') },
					]}
				/>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

					{/* Row 1: Name, Slug, Prices, Description, Category + Tags */}
					<Card>
						<CardHeader>
							<CardTitle>
								{id
									? `${t('products.editing') || 'Editando producto'} "${productName}"`
									: t('products.create_title')}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.name')}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t('products.name')} />
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
											<FormLabel>{t('products.slug')}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t('products.slug')} value={field.value || ''} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="cost_price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.cost_price')}</FormLabel>
											<FormControl>
												<Input type="number" step="0.01" {...field} placeholder="0.00" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sale_price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.sale_price')}</FormLabel>
											<FormControl>
												<Input type="number" step="0.01" {...field} placeholder="0.00" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('products.description')}</FormLabel>
										<FormControl>
											<RichTextEditor value={field.value || ''} onChange={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="category_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.category')}</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
													{...field}
													value={field.value || ''}
												>
													<option value="">{t('products.all_categories')}</option>
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
									name="subcategory_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.subcategory')}</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
													{...field}
													value={field.value || ''}
													disabled={!form.watch('category_id')}
												>
													<option value="">{t('products.all_subcategories')}</option>
													{subcategories.map((cat) => (
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
											<FormLabel>{t('products.tags')}</FormLabel>
											<FormControl>
												<MultiSelect
													value={field.value || []}
													onValueChange={field.onChange}
													options={tags}
													placeholder={t('products.select_tags')}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="size_ids"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.sizes')}</FormLabel>
											<FormControl>
												<MultiSelect
													value={field.value || []}
													onValueChange={field.onChange}
													options={sizes}
													placeholder={t('products.select_sizes')}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Row 2: Cover + Gallery */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-1">
							<Card className="h-full">
								<CardHeader>
									<CardTitle>{t('products.cover')}</CardTitle>
								</CardHeader>
								<CardContent className="h-[calc(100%-2rem)]">
									<ImageUpload
										value={coverUrl}
										onChange={handleCoverChange}
										onRemove={() => handleCoverChange(null)}
									/>
								</CardContent>
							</Card>
						</div>
						<div className="md:col-span-2">
							<Card className="h-full">
								<CardHeader>
									<CardTitle>{t('products.gallery')}</CardTitle>
								</CardHeader>
								<CardContent className="h-[calc(100%-2rem)]">
									<ImageGallery
										images={gallery}
										onChange={setGallery}
										onRemoveExisting={id ? handleRemoveGalleryImage : undefined}
									/>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Row 3: Document */}
					<Card>
						<CardHeader>
							<CardTitle>{t('products.document')}</CardTitle>
						</CardHeader>
						<CardContent>
							{documentUrl ? (
								<div className="flex items-center justify-between">
									<a
										href={documentUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-500 hover:underline"
									>
										View Document
									</a>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDocumentChange(null)}
									>
										Remove
									</Button>
								</div>
							) : (
								<Input
									type="file"
									accept=".pdf,.txt,.doc,.docx"
									onChange={(e) => handleDocumentChange(e.target.files?.[0] || null)}
								/>
							)}
						</CardContent>
					</Card>

					{/* Row 4: Status, Order, Featured */}
					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.status')}</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
													{...field}
												>
													<option value="draft">{t('products.status_draft')}</option>
													<option value="published">{t('products.status_published')}</option>
													<option value="archived">{t('products.status_archived')}</option>
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
											<FormLabel>{t('products.order')}</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
										<FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-6">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<FormLabel className="font-normal">
												{t('products.featured')}
											</FormLabel>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Row 5: Actions */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => navigate("/products")}>
							<X className="mr-2 h-4 w-4" />
							{t('common.cancel')}
						</Button>
						<Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<Save className="mr-2 h-4 w-4" />
							{t('common.save')}
						</Button>
					</div>

				</form>
			</Form>
		</div>
	);
}

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
import { Loader2, Save, X, Plus, Trash2, List, Wand2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImageGallery } from "@/components/ui/image-gallery";
import { MultiSelect } from "@/components/ui/multi-select";
import { PageHeader } from "@/components/page-header";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";

export default function ProductForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [sizes, setSizes] = useState([]);
	const [colors, setColors] = useState([]);
	const [coverUrl, setCoverUrl] = useState(null);
	const [pendingCover, setPendingCover] = useState(null);
	const [removeCover, setRemoveCover] = useState(false);
	const [gallery, setGallery] = useState([]);
	const [productName, setProductName] = useState("");
	const [colorImageUrls, setColorImageUrls] = useState({});
	const [pendingColorImages, setPendingColorImages] = useState({});
	const [fillingFakeData, setFillingFakeData] = useState(false);

	const formSchema = z.object({
		name: z.string().min(3, t('products.validation.name_min')),
		code: z.string().min(1, t('products.validation.required') || 'Campo requerido'),
		slug: z.string().nullable(),
		description: z.string().nullable(),
		cost_price: z.coerce.number({
			invalid_type_error: t('products.validation.number'),
			required_error: t('products.validation.cost_price_required')
		}).min(0, t('products.validation.min_zero')),
		sale_price: z.coerce.number({
			invalid_type_error: t('products.validation.number'),
			required_error: t('products.validation.sale_price_required')
		}).min(0, t('products.validation.min_zero')),
		wholesale_price: z.coerce.number({
			invalid_type_error: t('products.validation.number')
		}).min(0, t('products.validation.min_zero')).optional().nullable().default(0),
		discount: z.coerce.number({
			invalid_type_error: t('products.validation.number')
		}).min(0, t('products.validation.min_zero')).max(100).optional().nullable().default(0),
		category_id: z.string().min(1, t('products.validation.category_required')),
		tag_ids: z.array(z.number()).default([]),
		size_ids: z.array(z.number()).default([]),
		color_ids: z.array(z.number()).default([]),
		variants: z.array(z.object({
			id: z.number().optional().nullable(),
			product_color_id: z.number().optional().nullable(),
			product_size_id: z.number().optional().nullable(),
			sku: z.string().optional().nullable(),
			stock: z.coerce.number().default(0),
			price: z.coerce.number().optional().nullable(),
			wholesale_price: z.coerce.number().optional().nullable(),
			discount: z.coerce.number().optional().nullable(),
			active: z.boolean().default(true),
		})).default([]),
		status: z.enum(["draft", "published", "archived"]),
		order: z.coerce.number().optional().default(0),
		featured: z.boolean().default(false),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			code: "",
			slug: "",
			description: "",
			cost_price: 0,
			sale_price: 0,
			wholesale_price: 0,
			discount: 0,
			category_id: "",
			tag_ids: [],
			size_ids: [],
			color_ids: [],
			variants: [],
			status: "draft",
			order: 0,
			featured: false,
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [catsRes, tagsRes, sizesRes, colorsRes] = await Promise.all([
					axiosClient.get("product-categories?all=1"),
					axiosClient.get("product-tags?all=1"),
					axiosClient.get("product-sizes?all=1"),
					axiosClient.get("product-colors?all=1")
				]);
				setCategories(catsRes.data.data || []);
				setTags(tagsRes.data.data || []);
				setSizes(sizesRes.data.data || []);
				setColors(colorsRes.data.data || []);
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
						code: data.data.code || "",
						slug: data.data.slug || "",
						description: data.data.description || "",
						cost_price: data.data.cost_price || 0,
						sale_price: data.data.sale_price || 0,
						wholesale_price: data.data.wholesale_price || 0,
						discount: data.data.discount || 0,
						category_id: data.data.category_id?.toString() || "",
						tag_ids: data.data.tags?.map(tag => tag.id) || [],
						size_ids: data.data.sizes?.map(size => size.id) || [],
						color_ids: data.data.colors?.map(color => color.id) || [],
						variants: data.data.variants?.map(v => ({
							...v,
							price: v.price?.toString() || "",
							wholesale_price: v.wholesale_price?.toString() || "",
							discount: v.discount?.toString() || "",
						})) || [],
						status: data.data.status,
						order: data.data.order || 0,
						featured: data.data.featured || false,
					});
					setCoverUrl(data.data.cover_url);
					setGallery(data.data.gallery || []);
					setProductName(data.data.name);

					const initialColorUrls = {};
					if (data.data.color_images) {
						data.data.color_images.forEach(img => {
							initialColorUrls[img.color_id] = img.image_url;
						});
					}
					setColorImageUrls(initialColorUrls);

					setFetching(false);
				})
				.catch(() => {
					setFetching(false);
				});
		}
	}, [id, form]);

	const fetchFakeImage = async (width = 800, height = 800, filename = 'image.jpg') => {
		try {
			const res = await fetch(`https://picsum.photos/${width}/${height}`);
			const blob = await res.blob();
			return new File([blob], filename, { type: 'image/jpeg' });
		} catch (error) {
			console.error("Error fetching fake image:", error);
			return null;
		}
	};

	const fillFakeData = async () => {
		if (id) {
			toast.error(t('common.error_occurred') || "No válido en modo edición");
			return;
		}

		setFillingFakeData(true);
		toast.info("Generando datos y descargando imágenes completas de prueba...");

		try {
			const randomCat = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : "";
			const randomTags = tags.length > 0 ? tags.slice(0, 2).map(t => t.id) : [];
			const randomSizes = sizes.length > 0 ? sizes.slice(0, 3).map(s => s.id) : [];
			const randomColors = colors.length > 0 ? colors.slice(0, 2).map(c => c.id) : [];

			const fakeName = "Producto Auto " + Math.floor(Math.random() * 1000);
            
			form.reset({
				...form.getValues(),
				name: fakeName,
				code: "PROD-" + Math.floor(Math.random() * 10000),
				description: "<p>Esta es una descripción generada automáticamente para pruebas con imágenes de Picsum.</p>",
				cost_price: 1500,
				sale_price: 3500,
				wholesale_price: 2800,
				discount: 5,
				category_id: randomCat.toString(),
				tag_ids: randomTags,
				size_ids: randomSizes,
				color_ids: randomColors,
				status: "published",
				featured: true,
			});
			setProductName(fakeName);

			// Cover
			const coverFile = await fetchFakeImage(800, 800, 'cover.jpg');
			if (coverFile) handleCoverChange(coverFile);

			// Gallery
			const g1 = await fetchFakeImage(800, 800, 'gal1.jpg');
			const g2 = await fetchFakeImage(800, 800, 'gal2.jpg');
			const newGallery = [];
			if (g1) newGallery.push({ id: `new-${Date.now()}-1`, file: g1, preview: URL.createObjectURL(g1) });
			if (g2) newGallery.push({ id: `new-${Date.now()}-2`, file: g2, preview: URL.createObjectURL(g2) });
			setGallery(newGallery);

			// Color Images
			const newPendingColorImages = {};
			const newColorImageUrls = {};
			for (const cid of randomColors) {
				const cFile = await fetchFakeImage(800, 800, `color_${cid}.jpg`);
				if (cFile) {
					newPendingColorImages[cid] = cFile;
					newColorImageUrls[cid] = URL.createObjectURL(cFile);
				}
			}
			setPendingColorImages(newPendingColorImages);
			setColorImageUrls(newColorImageUrls);

			// Generate Variants
			setTimeout(() => {
				generateVariants();
				toast.success("¡Datos y fotos cargados!");
			}, 500);

		} catch (error) {
			console.error(error);
			toast.error("Hubo un error al generar fotos falsas.");
		} finally {
			setFillingFakeData(false);
		}
	};


	const handleCoverChange = (file) => {
		setPendingCover(file);
		if (file) {
			setCoverUrl(URL.createObjectURL(file));
			setRemoveCover(false);
		} else {
			setCoverUrl(null);
			setRemoveCover(true);
		}
	};

	const handleColorImageChange = (colorId, file) => {
		setPendingColorImages(prev => ({ ...prev, [colorId]: file || null }));
		if (file) {
			setColorImageUrls(prev => ({ ...prev, [colorId]: URL.createObjectURL(file) }));
		} else {
			setColorImageUrls(prev => {
				const next = { ...prev };
				delete next[colorId];
				return next;
			});
		}
	};

	const generateVariants = () => {
		const selectedSizeIds = form.getValues('size_ids') || [];
		const selectedColorIds = form.getValues('color_ids') || [];
		const currentVariants = form.getValues('variants') || [];

		const newVariants = [];

		// Both colors AND sizes are required to generate variants
		if (selectedSizeIds.length === 0 || selectedColorIds.length === 0) {
			toast.error(t('products.select_sizes_and_colors'));
			return;
		}

		// Combinations
		const colorIds = selectedColorIds;
		const sizeIds = selectedSizeIds;

		const productCode = form.getValues('code') || "";

		colorIds.forEach(colorId => {
			sizeIds.forEach(sizeId => {
				// Check if already exists
				const exists = currentVariants.find(v =>
					v.product_color_id === colorId && v.product_size_id === sizeId
				);

				if (exists) {
					newVariants.push(exists);
				} else {
					const colorObj = colors.find(c => c.id === colorId);
					const sizeObj = sizes.find(s => s.id === sizeId);

					let generatedSku = productCode;
					if (colorObj) generatedSku += `-${colorObj.name.toUpperCase().replace(/\s+/g, '')}`;
					if (sizeObj) generatedSku += `-${sizeObj.name.toUpperCase().replace(/\s+/g, '')}`;

					newVariants.push({
						product_color_id: colorId,
						product_size_id: sizeId,
						sku: generatedSku,
						stock: 0,
						price: "",
						wholesale_price: "",
						discount: "",
						active: true
					});
				}
			});
		});

		form.setValue('variants', newVariants);
	};

	const applyToAllPrice = (value) => {
		const variants = form.getValues('variants').map(v => ({ ...v, price: value }));
		form.setValue('variants', variants);
		toast.info(t('products.apply_to_all_price_info'));
	};

	const applyToAllWholesale = (value) => {
		const variants = form.getValues('variants').map(v => ({ ...v, wholesale_price: value }));
		form.setValue('variants', variants);
		toast.info(t('products.apply_to_all_wholesale_info'));
	};

	const applyToAllStock = (value) => {
		const variants = form.getValues('variants').map(v => ({ ...v, stock: parseInt(value) || 0 }));
		form.setValue('variants', variants);
		toast.info(t('products.apply_to_all_stock_info'));
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
			} else if (key === 'color_ids') {
				values[key].forEach((colorId) => formData.append('color_ids[]', colorId));
			} else if (key === 'variants') {
				values[key].forEach((variant, index) => {
					Object.keys(variant).forEach(vKey => {
						if (variant[vKey] !== null && variant[vKey] !== undefined) {
							// Cast boolean to 1/0 for Laravel's boolean validator
							let val = variant[vKey];
							if (typeof val === 'boolean') {
								val = val ? '1' : '0';
							}
							formData.append(`variants[${index}][${vKey}]`, val);
						}
					});
				});
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
		} else if (removeCover) {
			formData.append("remove_cover", "1");
		}

		// Send gallery images with their order
		const newGalleryImages = gallery.filter(img => img.file);
		newGalleryImages.forEach((img) => {
			formData.append("gallery[]", img.file);
		});

		// Send gallery order for all images (existing IDs and new filenames)
		const galleryOrder = {};
		gallery.forEach((img, index) => {
			if (img.file) {
				// New image: use filename as key
				galleryOrder[img.file.name] = index;
			} else if (img.id) {
				// Existing image: use ID as key
				galleryOrder[img.id] = index;
			}
		});
		formData.append("gallery_order", JSON.stringify(galleryOrder));

		// Send color images
		let colorImageIndex = 0;
		Object.entries(pendingColorImages).forEach(([colorId, file]) => {
			if (file) {
				formData.append(`color_images[${colorImageIndex}][color_id]`, colorId);
				formData.append(`color_images[${colorImageIndex}][file]`, file);
				colorImageIndex++;
			} else if (file === null) {
				formData.append('remove_color_images[]', colorId);
			}
		});

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
									? `${t('products.editing')} "${productName}"`
									: t('products.create_title')}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Row 1: Name and Code */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.name')}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t('products.name_placeholder')} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.code')}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={t('products.code_placeholder')} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Row 2: Slug */}
							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('products.slug')}</FormLabel>
										<FormControl>
											<Input {...field} placeholder={t('products.slug_placeholder')} value={field.value || ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Row 3: Prices - 4 columns */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

								<FormField
									control={form.control}
									name="wholesale_price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.wholesale_price')}</FormLabel>
											<FormControl>
												<Input type="number" step="0.01" {...field} placeholder="0.00" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="discount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.discount')}</FormLabel>
											<FormControl>
												<Input type="number" step="0.01" {...field} placeholder="0%" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Row 4: Category, Tags  */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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



							</div>


						</CardContent>
					</Card>

					{/* Variants Matrix */}
					<Card>
						<CardHeader>
							<CardTitle>{t('products.variants_title')}</CardTitle>
						</CardHeader>



						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

								<FormField
									control={form.control}
									name="color_ids"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('products.colors')}</FormLabel>
											<FormControl>
												<MultiSelect
													value={field.value || []}
													onValueChange={field.onChange}
													options={colors}
													placeholder={t('products.select_colors')}
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

							<div className="flex flex-col gap-6 p-4 border rounded-lg bg-muted/30">
								<div className="flex justify-start">
									<Button type="button" variant="" onClick={generateVariants}>
										<List className="mr-2 h-4 w-4" />
										{t('products.generate_variants')}
									</Button>
								</div>

								<div className="flex flex-wrap items-end gap-4 p-4 border rounded-md bg-background shadow-sm">
									<div className="flex flex-col gap-2">
										<span className="text-xs font-bold uppercase text-muted-foreground">{t('products.sale_price')}</span>
										<div className="flex overflow-hidden h-9 border rounded-md">
											<Input
												id="bulk-price"
												type="number"
												className="w-24 h-full border-0 rounded-none focus-visible:ring-0 px-3 text-sm"
												placeholder="0.00"
											/>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="rounded-none border-l h-full px-3"
												onClick={() => applyToAllPrice(document.getElementById('bulk-price').value)}
											>
												{t('products.apply_to_all_price')}
											</Button>
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<span className="text-xs font-bold uppercase text-muted-foreground">{t('products.wholesale_price')}</span>
										<div className="flex overflow-hidden h-9 border rounded-md">
											<Input
												id="bulk-wholesale"
												type="number"
												className="w-24 h-full border-0 rounded-none focus-visible:ring-0 px-3 text-sm"
												placeholder="0.00"
											/>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="rounded-none border-l h-full px-3"
												onClick={() => applyToAllWholesale(document.getElementById('bulk-wholesale').value)}
											>
												{t('products.apply_to_all_wholesale')}
											</Button>
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<span className="text-xs font-bold uppercase text-muted-foreground">{t('products.stock')}</span>
										<div className="flex overflow-hidden h-9 border rounded-md">
											<Input
												id="bulk-stock"
												type="number"
												className="w-20 h-full border-0 rounded-none focus-visible:ring-0 px-3 text-sm"
												placeholder="0"
											/>
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="rounded-none border-l h-full px-3"
												onClick={() => applyToAllStock(document.getElementById('bulk-stock').value)}
											>
												{t('products.apply_to_all_stock')}
											</Button>
										</div>
									</div>
								</div>
							</div>

							<div className="border rounded-md overflow-hidden bg-card">
								{form.watch('variants')?.length > 0 ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{t('products.variant_combination')}</TableHead>
												<TableHead>{t('products.sku')}</TableHead>
												<TableHead>{t('products.stock')}</TableHead>
												<TableHead>{t('products.price_unit')}</TableHead>
												<TableHead>{t('products.wholesale_price')}</TableHead>
												<TableHead>{t('products.discount')}</TableHead>
												<TableHead className="w-[50px]"></TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{form.watch('variants').map((variant, index) => {
												const color = colors.find(c => c.id === variant.product_color_id);
												const size = sizes.find(s => s.id === variant.product_size_id);
												return (
													<TableRow key={index}>
														<TableCell className="font-medium">
															<div className="flex items-center gap-2">
																{color && (
																	<div
																		className="w-4 h-4 rounded-full border"
																		style={{ backgroundColor: color.hex_color }}
																		title={color.name}
																	/>
																)}
																<span>{color?.name || t('common.none')}</span>
																<span>/</span>
																<span>{size?.name || t('common.none')}</span>
															</div>
														</TableCell>
														<TableCell>
															<Input
																value={variant.sku || ""}
																onChange={(e) => {
																	const newVariants = [...form.getValues('variants')];
																	newVariants[index].sku = e.target.value;
																	form.setValue('variants', newVariants);
																}}
																placeholder="SKU"
															/>
														</TableCell>
														<TableCell>
															<Input
																type="number"
																value={variant.stock ?? 0}
																onChange={(e) => {
																	const newVariants = [...form.getValues('variants')];
																	newVariants[index].stock = parseInt(e.target.value) || 0;
																	form.setValue('variants', newVariants);
																}}
																className="w-24"
															/>
														</TableCell>
														<TableCell>
															<Input
																type="number"
																step="0.01"
																value={variant.price || ""}
																onChange={(e) => {
																	const newVariants = [...form.getValues('variants')];
																	newVariants[index].price = e.target.value;
																	form.setValue('variants', newVariants);
																}}
																placeholder={form.getValues('sale_price')}
																className="w-24"
															/>
														</TableCell>
														<TableCell>
															<Input
																type="number"
																step="0.01"
																value={variant.wholesale_price || ""}
																onChange={(e) => {
																	const newVariants = [...form.getValues('variants')];
																	newVariants[index].wholesale_price = e.target.value;
																	form.setValue('variants', newVariants);
																}}
																placeholder={form.getValues('wholesale_price')}
																className="w-24"
															/>
														</TableCell>
														<TableCell>
															<Input
																type="number"
																step="0.01"
																value={variant.discount || ""}
																onChange={(e) => {
																	const newVariants = [...form.getValues('variants')];
																	newVariants[index].discount = e.target.value;
																	form.setValue('variants', newVariants);
																}}
																placeholder={form.getValues('discount')}
																className="w-20"
															/>
														</TableCell>
														<TableCell>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => {
																	const newVariants = form.getValues('variants').filter((_, i) => i !== index);
																	form.setValue('variants', newVariants);
																}}
															>
																<Trash2 className="h-4 w-4 text-destructive" />
															</Button>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								) : (
									<div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-muted-foreground">
										<List className="h-8 w-8 mb-2" />
										<p>{t('products.no_variants')}</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Images per Color */}
					{form.watch('color_ids')?.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>{t('products.color_images') || 'Imágenes por Color'}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
									{form.watch('color_ids').map(colorId => {
										// eslint-disable-next-line eqeqeq
										const color = colors.find(c => c.id == colorId);
										if (!color) return null;
										return (
											<div key={colorId} className="border rounded-md p-4 flex flex-col gap-4 bg-muted/10 relative">
												<div className="flex items-center gap-3 border-b pb-2">
													<div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: color.hex_color }} />
													<span className="font-semibold">{color.name}</span>
												</div>
												<div className="w-full relative min-h-[160px]">
													<ImageUpload
														value={colorImageUrls[colorId] || null}
														onChange={(file) => handleColorImageChange(colorId, file)}
														onRemove={() => handleColorImageChange(colorId, null)}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}

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
										value={gallery}
										onChange={setGallery}
										onRemoveExisting={id ? handleRemoveGalleryImage : undefined}
									/>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Row 5: Description - Full width */}
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

					{/* Row 3: Status, Order, Featured */}
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
						{!id && (
							<Button type="button" variant="secondary" onClick={fillFakeData} disabled={loading || fillingFakeData}>
								{fillingFakeData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
								Llenar Datos
							</Button>
						)}
						<Button variant="outline" onClick={() => navigate("/products")} type="button">
							<X className="mr-2 h-4 w-4" />
							{t('common.cancel')}
						</Button>
						<Button onClick={form.handleSubmit(onSubmit)} disabled={loading || fillingFakeData}>
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

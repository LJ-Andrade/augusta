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
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/page-header";

export default function TagForm() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [tagName, setTagName] = useState("");

	const formSchema = z.object({
		name: z.string().min(1, t('validation.name_min')),
		slug: z.string().nullable(),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	useEffect(() => {
		if (id) {
			setFetching(true);
			axiosClient
				.get(`product-tags/${id}`)
				.then(({ data }) => {
					form.reset({
						name: data.data.name,
						slug: data.data.slug || "",
					});
					setTagName(data.data.name);
					setFetching(false);
				})
				.catch(() => {
					setFetching(false);
				});
		}
	}, [id, form]);

	const onSubmit = (values) => {
		setLoading(true);

		const formData = new FormData();
		Object.keys(values).forEach((key) => {
			if (values[key]) {
				formData.append(key, values[key]);
			}
		});

		if (id) {
			formData.append("_method", "PUT");
			axiosClient.post(`product-tags/${id}`, formData)
				.then(() => {
					toast.success(t('product_tags.update_success'));
					navigate("/product-tags");
				})
				.catch((error) => {
					if (error.response?.data?.errors) {
						Object.entries(error.response.data.errors).forEach(([key, messages]) => {
							form.setError(key, { message: messages[0] });
						});
					}
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			axiosClient.post("product-tags", formData)
				.then(() => {
					toast.success(t('product_tags.create_success'));
					navigate("/product-tags");
				})
				.catch((error) => {
					if (error.response?.data?.errors) {
						Object.entries(error.response.data.errors).forEach(([key, messages]) => {
							form.setError(key, { message: messages[0] });
						});
					}
				})
				.finally(() => {
					setLoading(false);
				});
		}
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
					title={`Editar: ${tagName}`}
					breadcrumbs={[
						{ label: "Productos", href: "/products" },
						{ label: "Etiquetas", href: "/product-tags" },
						{ label: "Editar" },
					]}
				/>
			) : (
				<PageHeader
					title="Crear Etiqueta"
					breadcrumbs={[
						{ label: "Productos", href: "/products" },
						{ label: "Etiquetas", href: "/product-tags" },
						{ label: "Crear" },
					]}
				/>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Card className="max-w-2xl">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
							<CardTitle className="text-2xl">{id ? t('product_tags.edit_title', { name: tagName }) : t('product_tags.create_title')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('product_tags.name')}</FormLabel>
										<FormControl>
											<Input {...field} placeholder={t('product_tags.name')} />
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
										<FormLabel>{t('product_tags.slug')}</FormLabel>
										<FormControl>
											<Input {...field} placeholder={t('product_tags.slug')} value={field.value || ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex gap-2 justify-end">
								<Button type="button" variant="outline" onClick={() => navigate("/product-tags")}>
									<X className="mr-2 h-4 w-4" />
									{t('common.cancel')}
								</Button>
								<Button type="submit" disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									<Save className="mr-2 h-4 w-4" />
									{id ? t('product_tags.update_button') : t('product_tags.create_button')}
								</Button>
							</div>
						</CardContent>
					</Card>
				</form>
			</Form>
		</div>
	);
}

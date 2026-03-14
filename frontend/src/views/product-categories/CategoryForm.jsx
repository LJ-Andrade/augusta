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

export default function CategoryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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
        .get(`product-categories/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
            slug: data.data.slug || "",
          });
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
      if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
      }
    });

    if (id) {
      formData.append('_method', 'PUT');
      axiosClient.post(`product-categories/${id}`, formData)
        .then(() => {
          toast.success(t('product_categories.update_success'));
          navigate("/product-categories");
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
      axiosClient.post("product-categories", formData)
        .then(() => {
          toast.success(t('product_categories.create_success'));
          navigate("/product-categories");
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
      <PageHeader
        title={id ? t('product_categories.edit_title', { name: '' }) : t('product_categories.create_title')}
        breadcrumbs={[
          { label: "PRODUCTOS" },
          { label: "Categoría", href: "/product-categories" },
          { label: id ? t('common.edit') : t('common.create') }
        ]}
      />
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <CardTitle className="text-2xl">{id ? t('product_categories.edit_title', { name: '' }) : t('product_categories.create_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product_categories.name', 'Nombre')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('product_categories.name_placeholder', 'Ej: Remeras')} />
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
                  <FormLabel>{t('product_categories.slug')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('product_categories.slug')} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/product-categories")}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? t('product_categories.update_button') : t('product_categories.create_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
    </div>
    </div>
  );
}

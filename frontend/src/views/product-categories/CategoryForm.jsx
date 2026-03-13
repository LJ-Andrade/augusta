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

export default function CategoryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);

  const formSchema = z.object({
    name: z.string().min(1, t('validation.name_min')),
    slug: z.string().nullable(),
    parent_id: z.string().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "",
    },
  });

  useEffect(() => {
    axiosClient.get("product-categories?all=1").then(({ data }) => {
      setCategories(data.data || []);
    });

    if (id) {
      setFetching(true);
      axiosClient
        .get(`product-categories/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
            slug: data.data.slug || "",
            parent_id: data.data.parent_id?.toString() || "",
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
      if (values[key]) {
        formData.append(key, values[key]);
      }
    });

    if (id) {
      axiosClient.put(`product-categories/${id}`, formData)
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? t('product_categories.edit_title', { name: '' }) : t('product_categories.create_title')}
        </h1>
        <Button variant="outline" onClick={() => navigate("/product-categories")}>
          <X className="mr-2 h-4 w-4" />
          {t('common.cancel')}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{id ? t('product_categories.edit') : t('product_categories.create')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('product_categories.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('product_categories.name_placeholder')} />
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

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('product_categories.parent')}</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      {...field}
                      value={field.value || ''}
                    >
                      <option value="">{t('product_categories.no_parent')}</option>
                      {categories
                        .filter(cat => cat.id !== parseInt(id))
                        .map((cat) => (
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

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {id ? t('product_categories.update_button') : t('product_categories.create_button')}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  </div>
  );
}

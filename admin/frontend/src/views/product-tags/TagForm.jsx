import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { useCrudForm } from '@/hooks/use-crud-form';

export default function TagForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.name_min')),
    slug: z.string().nullable(),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'product-tags',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
      slug: '',
    },
    onSuccess: () => navigate('/product-tags'),
    messages: {
      createSuccess: t('product_tags.create_success'),
      updateSuccess: t('product_tags.update_success'),
      createError: t('product_tags.create_error'),
      updateError: t('product_tags.update_error'),
    },
  });

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
        title={
          id
            ? `${t('product_tags.editing') || 'Editando etiqueta'} "${entityName}"`
            : t('product_tags.create_title')
        }
        breadcrumbs={[
          { label: 'PRODUCTOS' },
          { label: t('product_tags.title') || 'Etiquetas', href: '/product-tags' },
          { label: id ? t('common.edit') : t('common.create') },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {id
                    ? `${t('product_tags.editing') || 'Editando etiqueta'} "${entityName}"`
                    : t('product_tags.create_title')}
                </CardTitle>
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
                  <Button type="button" variant="outline" onClick={() => navigate('/product-tags')}>
                    <X className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? t('common.save') : t('common.create')}
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

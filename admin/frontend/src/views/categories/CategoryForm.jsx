import { useNavigate, useParams } from 'react-router-dom';
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

export default function CategoryForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.name_min')),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'categories',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
    },
    onSuccess: () => navigate('/categories'),
    messages: {
      createSuccess: t('categories.create_success'),
      updateSuccess: t('categories.update_success'),
      createError: t('categories.create_error'),
      updateError: t('categories.update_error'),
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
            ? `${t('categories.editing') || 'Editando categoría'} "${entityName}"`
            : t('categories.create_title')
        }
        breadcrumbs={[
          { label: 'BLOG' },
          { label: t('categories.title') || 'Categorías', href: '/categories' },
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
                    ? `${t('categories.editing') || 'Editando categoría'} "${entityName}"`
                    : t('categories.create_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('categories.name')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('categories.name_placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/categories')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? t('categories.update_button') : t('categories.create_button')}
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

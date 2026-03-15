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

export default function TagForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.name_min')),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'tags',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
    },
    onSuccess: () => navigate('/tags'),
    messages: {
      createSuccess: t('tags.create_success'),
      updateSuccess: t('tags.update_success'),
      createError: t('tags.create_error'),
      updateError: t('tags.update_error'),
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
            ? `${t('tags.editing') || 'Editando etiqueta'} "${entityName}"`
            : t('tags.create_title')
        }
        breadcrumbs={[
          { label: 'BLOG' },
          { label: t('tags.title') || 'Etiquetas', href: '/tags' },
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
                    ? `${t('tags.editing') || 'Editando etiqueta'} "${entityName}"`
                    : t('tags.create_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tags.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('tags.name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/tags')}>
                    <X className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? t('tags.update_button') : t('tags.create_button')}
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

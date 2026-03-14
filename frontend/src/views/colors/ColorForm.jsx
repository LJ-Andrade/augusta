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

export default function ColorForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.name_min') || 'El nombre es requerido'),
    hex_color: z.string().regex(/^#[a-fA-F0-9]{6}$/, t('colors.invalid_hex') || 'Formato de color inválido (use #RRGGBB)'),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'colors',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
      hex_color: '#000000',
    },
    onSuccess: () => navigate('/colors'),
    messages: {
      createSuccess: t('colors.create_success') || 'Color creado correctamente',
      updateSuccess: t('colors.update_success') || 'Color actualizado correctamente',
      createError: t('colors.create_error') || 'Error al crear el color',
      updateError: t('colors.update_error') || 'Error al actualizar el color',
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
            ? `${t('colors.editing') || 'Editando color'} "${entityName}"`
            : t('colors.create_title') || 'Crear Color'
        }
        breadcrumbs={[
          { label: t('colors.title') || 'Colores', href: '/colors' },
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
                    ? `${t('colors.editing') || 'Editando color'} "${entityName}"`
                    : t('colors.create_title') || 'Crear Color'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('colors.name') || 'Nombre'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('colors.name_placeholder') || 'Ej: Rojo'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hex_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('colors.hex_color') || 'Color (Hexadecimal)'}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            {...field}
                            className="w-16 h-10 rounded cursor-pointer border border-input"
                          />
                          <Input
                            {...field}
                            placeholder="#FF0000"
                            className="flex-1 uppercase"
                            maxLength={7}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/colors')}>
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

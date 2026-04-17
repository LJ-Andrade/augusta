import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { useCrudForm } from '@/hooks/use-crud-form';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

export default function CouponForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    code: z.string().min(1, t('validation.required') || 'El código es requerido').toUpperCase(),
    discount_type: z.string().min(1, t('validation.required') || 'El tipo de descuento es requerido'),
    amount: z.number({ invalid_type_error: t('validation.required') || 'El monto es requerido' }).min(0, t('validation.amount_min') || 'El monto debe ser mayor o igual a 0'),
    expires_at: z.date().optional().nullable(),
    active: z.boolean().default(true),
  });

  const { form, loading, fetching, entityName, setEntityName, onSubmit } = useCrudForm({
    endpoint: 'coupons',
    id,
    schema: formSchema,
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      amount: 0,
      expires_at: null,
      active: true,
    },
    onSuccess: () => navigate('/product-coupons'),
    messages: {
      createSuccess: t('coupons.create_success') || 'Cupón creado correctamente',
      updateSuccess: t('coupons.update_success') || 'Cupón actualizado correctamente',
      createError: t('coupons.create_error') || 'Error al crear el cupón',
      updateError: t('coupons.update_error') || 'Error al actualizar el cupón',
    },
  });

  // Ensure amount is a number and set title code when data is loaded
  React.useEffect(() => {
    if (id && !fetching && form.getValues('code')) {
      const currentValues = form.getValues();
      if (typeof currentValues.amount === 'string') {
        form.setValue('amount', Number(currentValues.amount));
      }
      if (currentValues.expires_at && typeof currentValues.expires_at === 'string') {
        // Parse YYYY-MM-DD manually to avoid timezone offset issues (restar un día)
        const dateStr = currentValues.expires_at.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        form.setValue('expires_at', new Date(year, month - 1, day));
      }
      setEntityName(currentValues.code || '');
    }
  }, [id, fetching, form.getValues('code'), setEntityName]);

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log('=== FRONTEND: values antes de enviar ===', values);
    
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, format(value, 'yyyy-MM-dd'));
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    console.log('=== FRONTEND: FormData enviado ===');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (id) {
      formData.append('_method', 'PUT');
    }

    try {
      const response = id 
        ? await axiosClient.post(`coupons/${id}`, formData)
        : await axiosClient.post('coupons', formData);
      
      console.log('=== BACKEND: Response ===', response.data);
      
      toast.success(id ? t('coupons.update_success') : t('coupons.create_success'));
      navigate('/coupons');
      
      // Force reload by setting a timestamp
      window.dispatchEvent(new CustomEvent('refresh-coupons'));
      
      return response;
    } catch (error) {
      console.error('=== BACKEND: Error response ===', error.response?.data);
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setServerErrors(serverErrors);
      } else {
        toast.error(id ? t('coupons.update_error') : t('coupons.create_error'));
      }
      throw error;
    }
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
            ? `${t('coupons.editing') || 'Editando cupón'} "${entityName}"`
            : t('coupons.create_title') || 'Crear Cupón'
        }
        breadcrumbs={[
          { label: 'PRODUCTOS' },
          { label: t('coupons.title') || 'Cupones', href: '/coupons' },
          { label: id ? t('common.edit') : t('common.create') },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {id
                    ? `${t('coupons.editing') || 'Editando cupón'} "${entityName}"`
                    : t('coupons.create_title') || 'Crear Cupón'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.code') || 'Código'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={t('coupons.code_placeholder') || 'Ej: DESCUENTO20'} 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.discount_type') || 'Tipo de descuento'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('coupons.select_discount_type') || 'Seleccionar tipo'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">{t('coupons.percentage') || 'Porcentaje'}</SelectItem>
                          <SelectItem value="fixed">{t('coupons.fixed') || 'Fijo'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.amount') || 'Monto'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder={t('coupons.amount_placeholder') || 'Ej: 20'}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.expires_at') || 'Fecha de expiración'}</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('coupons.active') || 'Activo'}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/coupons')}>
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

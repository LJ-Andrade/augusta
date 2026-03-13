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
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { AvatarUpload } from "@/components/ui/avatar-upload";

export default function UserForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [roles, setRoles] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [pendingAvatar, setPendingAvatar] = useState(null);

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: id 
      ? z.string().optional().or(z.literal(""))
      : z.string().min(6, "Password must be at least 6 characters."),
    role_ids: z.array(z.number()).default([]),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role_ids: [],
    },
  });

  useEffect(() => {
    // Fetch all available roles
    axiosClient.get("roles?all=1").then(({ data }) => {
      setRoles(data.data || []);
    }).catch(error => {
      console.error("Error fetching roles:", error);
    });

    if (id) {
      setFetching(true);
      axiosClient
        .get(`users/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
            email: data.data.email,
            password: "",
            role_ids: data.data.roles?.map(role => role.id) || [],
          });
          setAvatarUrl(data.data.avatar_url);
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
        });
    }
  }, [id, form]);

  const handleAvatarChange = async (file) => {
    if (!id) {
      setPendingAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axiosClient.post(`users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(`${data.data.avatar_url}?t=${new Date().getTime()}`);
      toast.success(t('users.avatar_update_success') || "Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(t('users.avatar_update_error') || "Failed to update avatar");
    }
  };

  const onSubmit = (values) => {
    setLoading(true);
    const payload = { ...values };
    if (id && !payload.password) {
      delete payload.password;
    }

    let request;
    if (!id && pendingAvatar) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (Array.isArray(payload[key])) {
          payload[key].forEach((val) => formData.append(`${key}[]`, val));
        } else {
          formData.append(key, payload[key]);
        }
      });
      formData.append("avatar", pendingAvatar);
      request = axiosClient.post("users", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      request = id
        ? axiosClient.put(`users/${id}`, payload)
        : axiosClient.post("users", payload);
    }

    request
      .then(() => {
        toast.success(id ? t('users.update_success') : t('users.create_success'));
        navigate("/users");
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            form.setError(key, {
              type: "manual",
              message: errors[key][0],
            });
          });
        }
        setLoading(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{id ? t('users.edit_title', { name: form.getValues("name") }) : t('users.create_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center pb-6 border-b">
                <AvatarUpload 
                  value={avatarUrl} 
                  onChange={handleAvatarChange}
                />
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('users.name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('users.email_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.password_placeholder')} {id && t('users.password_help')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('users.password_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_ids"
                  render={() => (
                    <FormItem className="pt-4 border-t">
                      <FormLabel className="text-sm font-medium mb-3 block">{t('users.roles')}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name="role_ids"
                            render={({ field }) => (
                              <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, role.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== role.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {role.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/users")}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {id ? t('users.update_button') : t('users.create_button')}
                  </Button>
                </div>
              </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

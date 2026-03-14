import { useEffect, useState } from "react";
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
import { Loader2, KeyRound, User, Mail, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  const formSchema = z.object({
    name: z.string().min(2, t('validation.name_min') || "Name must be at least 2 characters."),
    email: z.string().email(t('validation.email_invalid') || "Invalid email address."),
    password: z.string().optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
  }).refine((data) => {
    if (data.password && data.password !== data.password_confirmation) {
      return false;
    }
    return true;
  }, {
    message: t('validation.passwords_mismatch') || "Passwords do not match",
    path: ["password_confirmation"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    axiosClient
      .get("user")
      .then(({ data }) => {
        const user = data.data;
        form.reset({
          name: user.name,
          email: user.email,
          password: "",
          password_confirmation: "",
        });
        setAvatarUrl(user.avatar_url);
        setUserRoles(user.roles || []);
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
      });
  }, [form]);

  const handleAvatarChange = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axiosClient.post(`profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(`${data.data.avatar_url}?t=${new Date().getTime()}`);
      toast.success(t('profile.avatar_update_success') || "Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(t('profile.avatar_update_error') || "Failed to update avatar");
    }
  };

  const onSubmit = (values) => {
    setLoading(true);
    const payload = { ...values };
    
    if (!showPassword || !payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }

    axiosClient.put('profile', payload)

      .then(() => {
        toast.success(t('profile.update_success') || "Profile updated successfully");
        setLoading(false);
        if (showPassword) {
          setShowPassword(false);
          form.setValue("password", "");
          form.setValue("password_confirmation", "");
        }
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

  const togglePassword = () => {
    const newValue = !showPassword;
    setShowPassword(newValue);
    if (!newValue) {
      form.setValue("password", "");
      form.setValue("password_confirmation", "");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {t('profile.title') || "My Profile"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t('profile.subtitle') || "Manage your account information and security settings."}
          </p>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center justify-center space-y-4 py-2">
                <AvatarUpload 
                  value={avatarUrl} 
                  onChange={handleAvatarChange}
                />
                <div className="text-center">
                  <h3 className="font-medium text-lg">{form.getValues("name")}</h3>
                  <p className="text-sm text-muted-foreground">{form.getValues("email")}</p>
                  {userRoles.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {userRoles.map((role) => (
                        <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('profile.name') || "Name"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('profile.name_placeholder') || "Your Name"} 
                              className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                              {...field} 
                            />
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
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {t('profile.email') || "Email"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder={t('profile.email_placeholder') || "Your Email"} 
                              className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{t('profile.security') || "Security"}</h4>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={togglePassword}
                        className="transition-all hover:bg-primary/10"
                      >
                        {showPassword ? t('common.cancel') : t('profile.change_password')}
                      </Button>
                    </div>
                    
                    {showPassword && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-muted/30 border border-muted-foreground/10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.password') || "New Password"}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={t('profile.password_placeholder') || "Enter new password"} 
                                  className="bg-background/50"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password_confirmation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.password_confirmation') || "Confirm New Password"}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={t('profile.password_confirmation_placeholder') || "Confirm new password"} 
                                  className="bg-background/50"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button type="submit" disabled={loading} className="px-8 shadow-md hover:shadow-lg transition-all">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('profile.update_button') || "Update Profile"}
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

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
export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [permissions, setPermissions] = useState([]);

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    permissions: z.array(z.number()).optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  useEffect(() => {
    // Fetch all permissions
    axiosClient.get("permissions?all=1").then(({ data }) => {
      setPermissions(data.data);
    });

    if (id) {
      setFetching(true);
      axiosClient
        .get(`roles/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
            permissions: data.data.permissions ? data.data.permissions.map((p) => p.id) : [],
          });
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
        });
    }
  }, [id, form]);

  const togglePermission = (permissionId) => {
    const currentSelected = form.getValues("permissions") || [];
    if (currentSelected.includes(permissionId)) {
      form.setValue(
        "permissions",
        currentSelected.filter((id) => id !== permissionId)
      );
    } else {
      form.setValue("permissions", [...currentSelected, permissionId]);
    }
  };

  const onSubmit = (values) => {
    setLoading(true);
    const request = id
      ? axiosClient.put(`roles/${id}`, values)
      : axiosClient.post("roles", values);

    request
      .then(() => {
        toast.success(id ? "Rol actualizado correctamente" : "Rol creado correctamente");
        navigate('/roles');
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
          <CardTitle>{id ? `Editando Rol ${name}` : "Crear Nuevo Rol"}</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Nombre"}</FormLabel>
                      <FormControl>
                        <Input placeholder={"Nombre del Rol"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{"Permisos"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-md p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
                    {permissions.length === 0 ? (
                      <p className="text-muted-foreground italic col-span-full">{"No se encontraron permisos."}</p>
                    ) : (
                      permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={form.watch("permissions")?.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium leading-none cursor-pointer select-none"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/roles')}
                  >
                    {"Cancelar"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {id ? "Actualizar Rol" : "Crear Rol"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

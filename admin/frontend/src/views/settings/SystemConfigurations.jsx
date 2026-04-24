import { Settings2 } from "lucide-react";

export default function SystemConfigurations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {"Configuración del Sistema"}
          </h1>
          <p className="text-muted-foreground">
            {"Funcionalidades avanzadas del sistema"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed rounded-lg">
        {"No hay configuraciones disponibles en este momento."}
      </div>
    </div>
  );
}

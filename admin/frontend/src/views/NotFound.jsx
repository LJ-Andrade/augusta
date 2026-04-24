import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
        404
      </h1>
      
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {"Página no encontrada"}
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        {"Lo sentimos, la página que estás buscando no existe o ha sido movida."}
      </p>

      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <button onClick={() => window.history.back()} className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Volver"}
          </button>
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {"Ir al inicio"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

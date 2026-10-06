import { Ticket, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tickets | NovaAdmin",
};

export default function TicketsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            Gestión de Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa y gestiona los tickets de soporte de los usuarios.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por ID, asunto o cliente..." 
            className="pl-9 h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 text-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="h-10 bg-blue-600 hover:bg-blue-700">
            + Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Ticket className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Próximamente</h3>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          El módulo de tickets se encuentra en desarrollo. Aquí podrás ver, responder y hacer seguimiento a las solicitudes de soporte.
        </p>
      </div>
    </div>
  );
}

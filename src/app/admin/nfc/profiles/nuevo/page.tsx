import { UserPlus } from "lucide-react";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default function NewNfcProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Crear Nuevo Perfil NFC
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completa los datos para crear un nuevo perfil digital que posteriormente podrás vincular a una tarjeta física.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
        <ProfileForm />
      </div>
    </div>
  );
}

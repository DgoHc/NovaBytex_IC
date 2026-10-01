import { notFound } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import { UserCog } from "lucide-react";
import ProfileForm from "../../nuevo/ProfileForm";

export const dynamic = "force-dynamic";

export default async function EditNfcProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const profile = await NfcService.getProfileByIdAdmin(resolvedParams.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-blue-600" />
          Editar Perfil NFC
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Modifica la información de {profile.name}. Los cambios se reflejarán inmediatamente en las tarjetas asignadas.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
        <ProfileForm initialData={profile} isEdit={true} />
      </div>
    </div>
  );
}

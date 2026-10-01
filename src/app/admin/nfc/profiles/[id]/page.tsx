import { notFound } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import { User, Cpu } from "lucide-react";
import Link from "next/link";
import CardManager from "./CardManager";
import ProfileActions from "./ProfileActions";

export const dynamic = "force-dynamic";

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object before using its properties in Next.js 15
  const resolvedParams = await params;
  const profile = await NfcService.getProfileByIdAdmin(resolvedParams.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Detalle del Perfil
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona la información de {profile.name} y sus tarjetas NFC asignadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Info Básica */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-300 mb-4 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">
              {profile.position} {profile.company && `en ${profile.company}`}
            </p>
            <div className="text-xs font-mono bg-slate-100 text-slate-500 py-1.5 px-3 rounded-lg inline-block mb-6">
              /{profile.slug}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <Link 
                href={`/admin/nfc/profiles/${profile.id}/editar`}
                className="w-full flex items-center justify-center h-10 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors text-sm"
              >
                Editar Perfil
              </Link>
              <ProfileActions profileId={profile.id} />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Gestión de Tarjetas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Tarjetas NFC Asignadas
              </h2>
            </div>
            <div className="p-5">
              {/* Le pasamos las tarjetas y el ID del perfil al gestor cliente */}
              <CardManager profileId={profile.id} initialCards={profile.cards || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

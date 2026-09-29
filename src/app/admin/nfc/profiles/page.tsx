import Link from "next/link";
import { Plus, Users, Search, Edit2 } from "lucide-react";
import { NfcService } from "@/services/NfcService";
import { Badge } from "@/components/ui/badge";

import type { NfcProfile } from "@/types/nfc";

export const dynamic = "force-dynamic";

export default async function NfcProfilesPage() {
  const profiles = await NfcService.listProfiles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Perfiles NFC
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los perfiles digitales asignados a las tarjetas NFC.
          </p>
        </div>
        <div>
          <Link
            href="/admin/nfc/profiles/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Perfil
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Tarjetas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay perfiles NFC creados.
                  </td>
                </tr>
              ) : (
                profiles?.map((profile: NfcProfile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 font-bold">
                            {profile.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{profile.name}</p>
                          <p className="text-xs text-slate-500">{profile.company || profile.position || "Sin empresa"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      /{profile.slug}
                    </td>
                    <td className="px-6 py-4">
                      {profile.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Activo</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {profile.cards?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/nfc/profiles/${profile.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar / Ver detalle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

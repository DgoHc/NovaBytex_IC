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

      {/* KPI Band */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Perfiles
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {profiles?.length || 0}
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Perfiles Activos
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {profiles?.filter(p => p.is_active).length || 0}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium w-48">Slug</th>
                <th className="px-4 py-3 font-medium w-32">Estado</th>
                <th className="px-4 py-3 font-medium text-right w-32">Tarjetas</th>
                <th className="px-4 py-3 font-medium text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No hay perfiles NFC creados.
                  </td>
                </tr>
              ) : (
                profiles?.map((profile: NfcProfile) => (
                  <tr key={profile.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-xs">
                            {profile.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[14px] text-slate-900 leading-tight">{profile.name}</p>
                          <p className="text-xs text-slate-500">{profile.company || profile.position || "Sin empresa"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      /{profile.slug}
                    </td>
                    <td className="px-4 py-3">
                      {profile.is_active ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs text-slate-700">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                          <span className="text-xs text-slate-700">Inactivo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600 font-medium">
                      {profile.cards?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/nfc/profiles/${profile.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900 inline-flex"
                        title="Editar Perfil"
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

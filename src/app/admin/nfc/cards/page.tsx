import { Cpu } from "lucide-react";
import Link from "next/link";
import { NfcService } from "@/services/NfcService";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NfcCardsPage() {
  // Obtenemos todos los perfiles para listar todas las tarjetas
  const profiles = await NfcService.listProfiles();
  const allCards = profiles?.flatMap((p: any) => 
    (p.cards || []).map((c: any) => ({ ...c, profileName: p.name, profileSlug: p.slug }))
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-600" />
          Tarjetas NFC
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Vista global de todas las tarjetas NFC físicas emitidas. Para gestionar una, ingresa al perfil correspondiente.
        </p>
      </div>

      {/* KPI Band */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Tarjetas
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {allCards.length}
          </p>
        </div>
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tarjetas Activas
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {allCards.filter((c: any) => c.status === 'ACTIVE').length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Código / URL</th>
                <th className="px-4 py-3 font-medium">Alias</th>
                <th className="px-4 py-3 font-medium">Asignada a</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No hay tarjetas NFC emitidas todavía.
                  </td>
                </tr>
              ) : (
                allCards.map((card: any) => (
                  <tr key={card.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-[14px] text-slate-700">{card.public_code}</div>
                      <div className="text-[11px] text-slate-400">/n/{card.public_code}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium text-sm">
                      {card.alias || "Tarjeta NFC"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/nfc/profiles/${card.profile_id}`} className="font-semibold text-blue-600 hover:underline">
                        {card.profileName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          card.status === 'ACTIVE' ? 'bg-emerald-500' :
                          card.status === 'PENDING' ? 'bg-amber-500' :
                          card.status === 'SUSPENDED' ? 'bg-rose-500' :
                          'bg-slate-300'
                        )} />
                        <span className="text-xs text-slate-700 capitalize">{card.status.toLowerCase()}</span>
                      </div>
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

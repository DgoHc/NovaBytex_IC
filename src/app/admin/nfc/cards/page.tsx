import { Cpu } from "lucide-react";
import Link from "next/link";
import { NfcService } from "@/services/NfcService";

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

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Código / URL</th>
                <th className="px-6 py-4">Alias</th>
                <th className="px-6 py-4">Asignada a</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No hay tarjetas NFC emitidas todavía.
                  </td>
                </tr>
              ) : (
                allCards.map((card: any) => (
                  <tr key={card.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-700">{card.public_code}</div>
                      <div className="text-xs text-slate-400 mt-1">/n/{card.public_code}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {card.alias || "Tarjeta NFC"}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/nfc/profiles/${card.profile_id}`} className="font-semibold text-blue-600 hover:underline">
                        {card.profileName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        card.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        card.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        card.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-200 text-slate-700'
                       }`}>
                        {card.status}
                      </span>
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

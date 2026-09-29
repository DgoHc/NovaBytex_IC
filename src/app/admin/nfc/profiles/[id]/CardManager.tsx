"use client";

import { useState } from "react";
import { Plus, CheckCircle2, XCircle, AlertCircle, Play, Pause, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { assignCardAction, updateCardStatusAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NfcCard, CardStatus } from "@/types/nfc";

interface CardManagerProps {
  profileId: string;
  initialCards: NfcCard[];
}

export default function CardManager({ profileId, initialCards }: CardManagerProps) {
  const [cards, setCards] = useState<NfcCard[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleAssignCard = async () => {
    setLoading(true);
    const result = await assignCardAction(profileId, "Nueva Tarjeta");
    if (result.success) {
      // Reload is handled by revalidatePath, but we might want to manually sync state if Next.js cache doesn't reflect immediately. 
      // A full page reload guarantees freshness for now.
      window.location.reload(); 
    } else {
      alert("Error al asignar tarjeta: " + result.error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (cardId: string, newStatus: CardStatus) => {
    setLoading(true);
    const result = await updateCardStatusAction(cardId, newStatus, profileId);
    if (result.success) {
      window.location.reload();
    } else {
      alert("Error al actualizar estado: " + result.error);
      setLoading(false);
    }
  };

  const getCardUrl = (code: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/n/${code}`;
  };

  const copyToClipboard = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const StatusBadge = ({ status }: { status: CardStatus }) => {
    const config = {
      PENDING: { color: "bg-amber-100 text-amber-700", label: "Pendiente" },
      ACTIVE: { color: "bg-emerald-100 text-emerald-700", label: "Activa" },
      SUSPENDED: { color: "bg-rose-100 text-rose-700", label: "Suspendida" },
      DISABLED: { color: "bg-slate-200 text-slate-700", label: "Desactivada" },
    };
    const c = config[status];
    return <span className={`text-xs font-bold px-2 py-1 rounded-md ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      {cards.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-900 font-bold mb-1">Sin tarjetas asignadas</h3>
          <p className="text-sm text-slate-500 mb-4">
            Este perfil aún no cuenta con tarjetas físicas NFC.
          </p>
          <Button onClick={handleAssignCard} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Asignar Primera Tarjeta
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={handleAssignCard} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
              <Plus className="w-3.5 h-3.5 mr-1" /> Asignar Otra Tarjeta
            </Button>
          </div>
          
          <div className="space-y-4">
            {cards.map((card) => {
              const url = getCardUrl(card.public_code);
              return (
                <div key={card.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900">{card.alias || "Tarjeta NFC"}</h4>
                      <StatusBadge status={card.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 select-all">
                        {card.public_code}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(url, card.public_code)}
                        className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                        {copiedCode === card.public_code ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>Copiar URL</span>
                      </button>
                    </div>
                    
                    {card.status === 'PENDING' && (
                      <div className="mt-3 text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded border border-blue-100">
                        <strong className="text-blue-700 block mb-1">Instrucciones de Programación:</strong>
                        1. Copia la URL de arriba.<br/>
                        2. Usa NFC Tools (Write &gt; URL).<br/>
                        3. Escribe la tarjeta física.<br/>
                        4. Comprueba y haz clic en "Activar".
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {card.status === 'PENDING' && (
                      <Button onClick={() => handleStatusChange(card.id, 'ACTIVE')} disabled={loading} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8">
                        <Play className="w-3.5 h-3.5 mr-1" /> Activar
                      </Button>
                    )}
                    
                    {card.status === 'ACTIVE' && (
                      <Button onClick={() => handleStatusChange(card.id, 'SUSPENDED')} disabled={loading} size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs h-8">
                        <Pause className="w-3.5 h-3.5 mr-1" /> Suspender
                      </Button>
                    )}
                    
                    {card.status === 'SUSPENDED' && (
                      <>
                        <Button onClick={() => handleStatusChange(card.id, 'ACTIVE')} disabled={loading} size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs h-8">
                          <Play className="w-3.5 h-3.5 mr-1" /> Reactivar
                        </Button>
                        <Button onClick={() => handleStatusChange(card.id, 'DISABLED')} disabled={loading} size="sm" variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-100 text-xs h-8">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Desactivar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  MessageCircle,
  Download
} from "lucide-react";
import QrModal from "@/components/nfc/QrModal";
import ShareButton from "@/components/nfc/ShareButton";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await NfcService.getProfileBySlug(resolvedParams.slug);
  
  if (!profile) return { title: "Perfil no encontrado" };
  
  return {
    title: `${profile.name} | Perfil Digital`,
    description: profile.description || `${profile.name} - ${profile.position || ''} ${profile.company || ''}`,
    robots: { index: false, follow: false }
  };
}

export default async function DigitalProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const profile = await NfcService.getProfileBySlug(resolvedParams.slug);

  if (!profile) {
    notFound();
  }

  const currentUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/card/${profile.slug}`
    : `https://novabytexrj.com/card/${profile.slug}`;

  const vcardUrl = `/api/nfc/profiles/${profile.slug}/vcard`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 sm:pb-12">
      <div className="h-48 md:h-64 bg-[#080D1F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="max-w-xl mx-auto px-6 relative -mt-24">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 text-center mb-8">
          <div className="w-32 h-32 mx-auto bg-white border-4 border-white rounded-full shadow-lg flex items-center justify-center text-4xl font-bold text-slate-300 mb-6 -mt-20 overflow-hidden relative z-10">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2" style={{ fontFamily: "var(--font-bodoni)" }}>
            {profile.name}
          </h1>
          
          {(profile.position || profile.company) && (
            <p className="text-blue-600 font-bold text-sm tracking-wide uppercase mb-4">
              {profile.position} {profile.company && <span className="text-slate-400 font-normal">en</span>} {profile.company}
            </p>
          )}

          {profile.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {profile.description}
            </p>
          )}

          {profile.whatsapp && (
            <a 
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0_8px_20px_rgba(37,211,102,0.3)] mb-4"
            >
              <MessageCircle className="w-6 h-6" />
              Hablar por WhatsApp
            </a>
          )}

          <div className="grid grid-cols-2 gap-3">
            <a 
              href={vcardUrl}
              className="flex items-center justify-center gap-2 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md"
            >
              <Download className="w-4 h-4" />
              Guardar
            </a>
            {profile.phone && (
              <a 
                href={`tel:${profile.phone}`}
                className="flex items-center justify-center gap-2 h-12 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                Llamar
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Correo Electrónico</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{profile.email}</p>
              </div>
            </a>
          )}

          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sitio Web</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{profile.website.replace(/^https?:\/\//, '')}</p>
              </div>
            </a>
          )}

          {profile.address && (
            <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mr-4 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ubicación</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight">{profile.address}</p>
              </div>
            </div>
          )}
        </div>

        {(profile.instagram || profile.facebook || profile.linkedin) && (
          <div className="flex justify-center gap-4 mb-10">
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
                <Globe className="w-6 h-6" />
              </a>
            )}
            {profile.facebook && (
              <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1877F2] text-white rounded-2xl flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
                <Globe className="w-6 h-6" />
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#0A66C2] text-white rounded-2xl flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
                <Globe className="w-6 h-6" />
              </a>
            )}
          </div>
        )}

        <div className="flex justify-center gap-8 mb-10 border-t border-slate-200 pt-8">
          <ShareButton url={currentUrl} title={`Perfil de ${profile.name}`} text={`Contacto de ${profile.name}`} />
          <QrModal url={currentUrl} name={profile.name} />
        </div>

        <div className="text-center pb-6">
          <a href="/" className="inline-block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            Potenciado por NovaBytex NFC
          </a>
        </div>
      </div>
    </div>
  );
}

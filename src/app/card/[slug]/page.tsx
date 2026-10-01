import { notFound } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import { Metadata } from "next";
import ClientDigitalCardView from "@/components/nfc/ClientDigitalCardView";

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

  return <ClientDigitalCardView profile={profile} />;
}

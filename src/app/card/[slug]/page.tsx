import type { Metadata } from "next";
import { getNFCProfile } from "@/lib/nfcProfiles";
import DigitalCardView from "@/components/nfc/DigitalCardView";

interface CardSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CardSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getNFCProfile(slug);

  return {
    title: `${profile.nombre} — Tarjeta Digital NFC`,
    description: profile.descripcion,
    openGraph: {
      title: `${profile.nombre} — Tarjeta Digital NFC`,
      description: profile.descripcion,
      url: `https://novabytex.com/card/${profile.slug}`,
      siteName: "Nova Bytex",
      images: [
        {
          url: profile.avatar || "/assets/branding/logonb.jpeg",
          width: 683,
          height: 450,
          alt: profile.nombre,
        },
      ],
      locale: "es_PE",
      type: "profile",
    },
  };
}

export default async function CardSlugPage({ params }: CardSlugPageProps) {
  const { slug } = await params;
  const profile = getNFCProfile(slug);

  return <DigitalCardView profile={profile} />;
}

import { NextRequest, NextResponse } from "next/server";
import { NfcService } from "@/services/NfcService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const profile = await NfcService.getProfileBySlug(slug);

  if (!profile) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Generación de archivo vCard 3.0
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${profile.name};;;`,
    `FN:${profile.name}`,
    profile.company ? `ORG:${profile.company}` : "",
    profile.position ? `TITLE:${profile.position}` : "",
    profile.phone ? `TEL;type=CELL;type=VOICE;type=pref:${profile.phone}` : "",
    profile.whatsapp ? `TEL;type=CELL;type=VOICE;type=MSG:${profile.whatsapp}` : "",
    profile.email ? `EMAIL;type=INTERNET;type=WORK;type=pref:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : "",
    profile.address ? `ADR;type=WORK:;;${profile.address};;;;` : "",
    profile.description ? `NOTE:${profile.description.replace(/\n/g, "\\n")}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${profile.slug}.vcf"`,
    },
  });
}

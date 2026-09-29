import type { NFCProfile } from "@/types/nfc";

/**
 * Generates a standard vCard 3.0 string compatible with both iOS and Android.
 */
export function generateVCard(profile: NFCProfile): string {
  const cleanPhone = profile.telefono.replace(/\s+/g, "");
  const noteText = (profile.descripcion || "").replace(/\r?\n/g, " ");

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN;CHARSET=UTF-8:${profile.empresa || profile.nombre}`,
    `N;CHARSET=UTF-8:${profile.nombre};;;;`,
    `ORG;CHARSET=UTF-8:${profile.empresa || "Nova Bytex Technology"}`,
    `TITLE;CHARSET=UTF-8:${profile.cargo || "Soluciones Tecnológicas & Suministros"}`,
    `TEL;TYPE=WORK,VOICE:${cleanPhone}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    `EMAIL;TYPE=INTERNET,PREF:${profile.email}`,
    `URL:${profile.website}`,
    `ADR;TYPE=WORK;CHARSET=UTF-8:;;${profile.ubicacion.direccion || ""};${profile.ubicacion.ciudad};${profile.ubicacion.ciudad};;${profile.ubicacion.pais}`,
    `NOTE;CHARSET=UTF-8:${noteText}`,
    "REV:" + new Date().toISOString(),
    "END:VCARD",
  ];

  return lines.join("\r\n");
}

/**
 * Initiates the client-side download of a .vcf contact card.
 */
export function downloadVCard(profile: NFCProfile): boolean {
  if (typeof window === "undefined") return false;

  try {
    const vcardData = generateVCard(profile);
    const blob = new Blob([vcardData], {
      type: "text/vcard;charset=utf-8",
    });

    const filename = `${(profile.slug || "contacto").toLowerCase()}-novabytex.vcf`;

    // iOS and Android modern browser handling
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 400);

    return true;
  } catch (err) {
    console.error("Error generating vCard download:", err);
    return false;
  }
}

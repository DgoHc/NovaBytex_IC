"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfileAction, updateProfileAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ClientDigitalCardView from "@/components/nfc/ClientDigitalCardView";
import type { NfcProfile } from "@/types/nfc";

interface ProfileFormProps {
  initialData?: NfcProfile;
  isEdit?: boolean;
}

export default function ProfileForm({ initialData, isEdit = false }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    company: initialData?.company || "",
    position: initialData?.position || "",
    description: initialData?.description || "",
    whatsapp: initialData?.whatsapp || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    address: initialData?.address || "",
    instagram: initialData?.instagram || "",
    facebook: initialData?.facebook || "",
    linkedin: initialData?.linkedin || "",
    // for preview only
    avatar_url: initialData?.avatar_url || "",
    logo_url: initialData?.logo_url || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    if (!isEdit) {
      data.append("is_active", "true");
    }

    if (isEdit && initialData) {
      const result = await updateProfileAction(initialData.id, data);
      if (result.success) {
        router.push(`/admin/nfc/profiles/${initialData.id}`);
      } else {
        setError(result.error || "Ocurrió un error al actualizar el perfil.");
        setLoading(false);
      }
    } else {
      const result = await createProfileAction(data);
      if (result.success) {
        router.push(`/admin/nfc/profiles/${result.id}`);
      } else {
        setError(result.error || "Ocurrió un error al crear el perfil.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Columna Izquierda: Formulario (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-4 pb-12 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ej. Juan Pérez" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (Opcional)</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="ej. juan-perez (Se autogenera si se deja vacío)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Ej. NovaBytex" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input id="position" name="position" value={formData.position} onChange={handleChange} placeholder="Ej. Director General" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Corta</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Una breve descripción profesional..." className="h-20" />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+51999888777" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (Llamadas)</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+51999888777" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="contacto@ejemplo.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.ejemplo.com" type="url" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección / Ubicación</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ej. Av. Principal 123, Ciudad" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." type="url" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Imágenes (URLs)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Foto de Perfil (Avatar URL)</Label>
                <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://ejemplo.com/mifoto.jpg" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo de Empresa (URL, Opcional)</Label>
                <Input id="logo_url" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://ejemplo.com/milogo.png" type="url" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Puedes alojar las imágenes en servicios como Imgur, Cloudinary, etc., y pegar el enlace directo aquí.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (isEdit ? "Guardando..." : "Creando...") : (isEdit ? "Guardar Cambios" : "Crear Perfil")}
            </Button>
          </div>
        </form>
      </div>

      {/* Columna Derecha: Previsualización en Tiempo Real (Estática) */}
      <div className="hidden lg:flex w-[400px] xl:w-[450px] border-l border-slate-200 pl-8 shrink-0 flex-col">
        <h3 className="text-sm font-bold text-slate-900 mb-4 shrink-0">Vista Previa</h3>
        <div className="flex-1 relative overflow-hidden flex justify-center items-start pt-4">
          <div className="rounded-[2.5rem] overflow-hidden border-[8px] border-slate-900 shadow-2xl h-[800px] w-full max-w-[380px] bg-slate-950 scale-[0.80] origin-top">
            <ClientDigitalCardView profile={formData} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfileAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("is_active", "true");

    const result = await createProfileAction(formData);

    if (result.success) {
      router.push(`/admin/nfc/profiles/${result.id}`);
    } else {
      setError(result.error || "Ocurrió un error al crear el perfil.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input id="name" name="name" required placeholder="Ej. Juan Pérez" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Identificador (Opcional)</Label>
          <Input id="slug" name="slug" placeholder="ej. juan-perez (Se autogenera si se deja vacío)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" name="company" placeholder="Ej. NovaBytex" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input id="position" name="position" placeholder="Ej. Director General" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción Corta</Label>
        <Textarea id="description" name="description" placeholder="Una breve descripción profesional..." className="h-20" />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="+51999888777" type="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (Llamadas)</Label>
            <Input id="phone" name="phone" placeholder="+51999888777" type="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" placeholder="contacto@ejemplo.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input id="website" name="website" placeholder="https://www.ejemplo.com" type="url" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección / Ubicación</Label>
            <Input id="address" name="address" placeholder="Ej. Av. Principal 123, Ciudad" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Redes Sociales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" placeholder="https://instagram.com/..." type="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" placeholder="https://facebook.com/..." type="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." type="url" />
          </div>
        </div>
      </div>
      
      {/* TODO: Fase 9 (Supabase Storage para Imágenes) */}
      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
        ℹ️ La subida de imágenes (Avatar y Logo) se habilitará desde la vista de edición una vez creado el perfil.
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? "Creando..." : "Crear Perfil"}
        </Button>
      </div>
    </form>
  );
}

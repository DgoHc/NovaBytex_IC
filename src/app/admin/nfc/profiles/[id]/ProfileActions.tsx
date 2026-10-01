"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProfileAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ProfileActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este perfil? Se eliminarán también las tarjetas vinculadas.")) {
      return;
    }
    
    setDeleting(true);
    const result = await deleteProfileAction(profileId);
    
    if (result.success) {
      router.push("/admin/nfc/profiles");
    } else {
      alert("Error al eliminar perfil: " + result.error);
      setDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDelete} 
      disabled={deleting}
      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {deleting ? "Eliminando..." : "Eliminar Perfil"}
    </Button>
  );
}

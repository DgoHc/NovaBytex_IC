"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NfcService } from "@/services/NfcService";
import type { NfcProfile, CardStatus } from "@/types/nfc";

export async function createProfileAction(formData: FormData) {
  const name = formData.get("name") as string;
  let slug = formData.get("slug") as string;
  
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }
  
  const payload: Partial<NfcProfile> = {
    name,
    slug,
    company: (formData.get("company") as string) || null,
    position: (formData.get("position") as string) || null,
    description: (formData.get("description") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    website: (formData.get("website") as string) || null,
    instagram: (formData.get("instagram") as string) || null,
    facebook: (formData.get("facebook") as string) || null,
    linkedin: (formData.get("linkedin") as string) || null,
    address: (formData.get("address") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
    is_active: formData.get("is_active") === "true",
  };

  try {
    const newProfile = await NfcService.createProfile(payload);
    revalidatePath("/admin/nfc/profiles");
    return { success: true, id: newProfile.id };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function assignCardAction(profileId: string, alias: string) {
  try {
    await NfcService.assignCardToProfile(profileId, alias);
    revalidatePath(`/admin/nfc/profiles/${profileId}`);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function updateCardStatusAction(cardId: string, status: CardStatus, profileId: string) {
  try {
    await NfcService.changeCardStatus(cardId, status);
    revalidatePath(`/admin/nfc/profiles/${profileId}`);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function updateProfileAction(id: string, formData: FormData) {
  const payload: Partial<NfcProfile> = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    company: (formData.get("company") as string) || null,
    position: (formData.get("position") as string) || null,
    description: (formData.get("description") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    website: (formData.get("website") as string) || null,
    instagram: (formData.get("instagram") as string) || null,
    facebook: (formData.get("facebook") as string) || null,
    linkedin: (formData.get("linkedin") as string) || null,
    address: (formData.get("address") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
  };

  try {
    await NfcService.updateProfile(id, payload);
    revalidatePath("/admin/nfc/profiles");
    revalidatePath(`/admin/nfc/profiles/${id}`);
    revalidatePath(`/card/${payload.slug}`);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteProfileAction(id: string) {
  try {
    await NfcService.deleteProfile(id);
    revalidatePath("/admin/nfc/profiles");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function deleteCardAction(cardId: string, profileId: string) {
  try {
    await NfcService.deleteCard(cardId);
    revalidatePath(`/admin/nfc/profiles/${profileId}`);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

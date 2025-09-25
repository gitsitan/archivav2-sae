"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Typage pour les résultats des actions
type ActionResponse<T> = {
  success: boolean;
  data?: T | null; // Data can be T or null
  error?: string;
};

// Interface pour les données du formulaire de groupe
export interface GroupFormData {
  name: string;
  description: string | null;
  permissions: string[] | null; // Permissions is an array of strings
  autorisations?: any | null; // JSON blob for autorisations (optional on input)
}

// Fonction pour récupérer un groupe par son ID
export async function getGroupById(id: string): Promise<ActionResponse<any>> {
  try {
    // 1. Convertissez la chaîne de caractères en entier
    const groupId = parseInt(id, 10);

    // 2. Vérifiez que la conversion a fonctionné
    if (isNaN(groupId)) {
      return { success: false, error: "ID invalide fourni." };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId }, // Utilisez le nombre entier converti
    });

    if (!group) {
      return { success: false, error: "Groupe non trouvé." };
    }

    return { success: true, data: group };
  } catch (error) {
    console.error("Erreur lors de la récupération du groupe:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du groupe.",
    };
  }
}

// Fonction pour créer un groupe
export async function createGroup(data: GroupFormData) {
  try {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description || null,
        permissions: data.permissions || [],
        autorisations: data.autorisations ?? {},
      },
    });
    revalidatePath("/admin/groups");
    return { success: true, data: group };
  } catch (error) {
    console.error("Erreur lors de la création du groupe:", error);
    return {
      success: false,
      error: "Erreur lors de la création du groupe",
    };
  }
}

// Fonction pour modifier les groupes
export async function updateGroup(
  groupId: string | number,
  data: GroupFormData
): Promise<ActionResponse<any>> {
  try {
    // Convertir l'ID en nombre si c'est une chaîne
    const numericGroupId =
      typeof groupId === "string" ? parseInt(groupId, 10) : groupId;

    if (isNaN(numericGroupId)) {
      return { success: false, error: "ID de groupe invalide" };
    }

    const group = await prisma.group.update({
      where: {
        id: numericGroupId,
      },
      data: {
        name: data.name,
        description: data.description || null,
        permissions: data.permissions || [],
        autorisations: data.autorisations ?? {},
      },
    });
    revalidatePath("/admin/groups");
    return { success: true, data: group };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du groupe:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du groupe",
    };
  }
}

// Fonction pour récupérer tous les groupes
export async function getGroups() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: groups };
  } catch (error) {
    console.error(
      "Erreur de l'API lors de la récupération des groupes:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des groupes.",
    };
  }
}

// Fonction pour supprimer un groupe (facultatif mais utile)
export async function deleteGroup(
  groupId: number
): Promise<ActionResponse<any>> {
  try {
    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });
    revalidatePath("/admin/groups");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du groupe.",
    };
  }
}

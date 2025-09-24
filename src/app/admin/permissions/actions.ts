"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResponse<T> = {
  success: boolean;
  data?: T | null;
  error?: string;
};

export interface PermissionFormData {
  permissions?: string[];
  name?: string;
}

export async function getGroupPermissionsById(id: string): Promise<
  ActionResponse<{
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  try {
    const groupId = parseInt(id, 10);

    if (isNaN(groupId)) {
      return { success: false, error: "ID invalide fourni." };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return { success: false, error: "Groupe non trouvé." };
    }

    const permissions = Array.isArray(group.permissions)
      ? (group.permissions as string[])
      : [];

    return {
      success: true,
      data: {
        ...group,
        permissions,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du groupe:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du groupe.",
    };
  }
}

// export async function updateGroupPermissions(
//   groupId: string | number,
//   data: PermissionFormData
// ): Promise<
//   ActionResponse<{
//     id: number;
//     name: string;
//     description: string | null;
//     permissions: string[];
//     createdAt: Date;
//     updatedAt: Date;
//   }>
// > {
//   try {
//     const numericGroupId =
//       typeof groupId === "string" ? parseInt(groupId, 10) : groupId;

//     if (isNaN(numericGroupId)) {
//       return { success: false, error: "ID de groupe invalide" };
//     }

//     const group = await prisma.group.update({
//       where: {
//         id: numericGroupId,
//       },
//       data: {
//         permissions: data.permissions || [],
//       },
//     });
//     revalidatePath("/admin/permissions");
//     revalidatePath("/admin/groups");

//     // Convertir les permissions en tableau de chaînes
//     const permissions = Array.isArray(group.permissions)
//       ? (group.permissions as string[])
//       : [];

//     return {
//       success: true,
//       data: {
//         ...group,
//         permissions,
//       },
//     };
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour des permissions:", error);
//     return {
//       success: false,
//       error: "Erreur lors de la mise à jour des permissions",
//     };
//   }
// }
export async function updateGroupPermissions(
  groupId: string | number,
  data: PermissionFormData
): Promise<
  ActionResponse<{
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  try {
    const numericGroupId =
      typeof groupId === "string" ? parseInt(groupId, 10) : groupId;

    if (isNaN(numericGroupId)) {
      return { success: false, error: "ID de groupe invalide" };
    }

    const { permissions, name } = data; // Destructuration pour récupérer le nom

    const group = await prisma.group.update({
      where: {
        id: numericGroupId,
      },
      data: {
        permissions: permissions || [],
        name: name, // Ajout de la mise à jour du nom
      },
    });
    revalidatePath("/admin/permissions");
    revalidatePath("/admin/groups");

    // Convertir les permissions en tableau de chaînes
    const updatedPermissions = Array.isArray(group.permissions)
      ? (group.permissions as string[])
      : [];

    return {
      success: true,
      data: {
        ...group,
        permissions: updatedPermissions,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des permissions:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des permissions",
    };
  }
}

// Fonction pour récupérer toutes les permissions disponibles depuis le fichier JSON
export async function getAvailablePermissions(): Promise<
  ActionResponse<
    {
      id: string;
      name: string;
      description: string;
    }[]
  >
> {
  try {
    return { success: true, data: [] };
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des permissions.",
    };
  }
}

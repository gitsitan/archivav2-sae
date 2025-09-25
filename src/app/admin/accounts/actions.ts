"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

export interface UserFormData {
  email: string;
  name?: string;
  isActive: boolean;
  groupIds?: number[];
}

// Créer un utilisateur
export async function createUser(data: UserFormData) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || null,
        role: "USER", // Rôle par défaut
        isActive: data.isActive,
        password: "changeme", // Mot de passe par défaut
        groups: data.groupIds && data.groupIds.length
          ? {
              create: data.groupIds.map((groupId) => ({
                group: { connect: { id: groupId } },
              })),
            }
          : undefined,
      },
      include: {
        groups: {
          include: { group: { select: { id: true, name: true } } },
        },
      },
    });

    revalidatePath("/admin/accounts");
    return { success: true, data: user };
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return { 
      success: false, 
      error: "Erreur lors de la création de l'utilisateur" 
    };
  }
}

// Récupérer tous les utilisateurs
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        groups: {
          include: { group: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Mapper pour inclure les informations des groupes
    const mappedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      groupIds: user.groups.map((ug) => ug.group.id),
      groupNames: user.groups.map((ug) => ug.group.name),
    }));

    return { success: true, data: mappedUsers };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des utilisateurs" 
    };
  }
}

// Récupérer un utilisateur par ID
export async function getUserById(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        groups: {
          include: { group: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) {
      return { 
        success: false, 
        error: "Utilisateur non trouvé" 
      };
    }

    const mappedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      groupIds: user.groups.map((ug) => ug.group.id),
      groupNames: user.groups.map((ug) => ug.group.name),
    };

    return { success: true, data: mappedUser };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération de l'utilisateur" 
    };
  }
}

// Mettre à jour un utilisateur
export async function updateUser(id: number, data: UserFormData) {
  try {
    // Mettre à jour les données de base de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name || null,
        role: "USER", // Rôle par défaut
        isActive: data.isActive,
      },
    });

    // Synchroniser les groupes si fournis
    if (Array.isArray(data.groupIds)) {
      // Récupérer les groupes existants
      const existing = await prisma.userGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const existingIds = new Set(existing.map((e) => e.groupId));
      const targetIds = new Set(data.groupIds);

      const toAdd = [...targetIds].filter((gid) => !existingIds.has(gid));
      const toRemove = [...existingIds].filter((gid) => !targetIds.has(gid));

      if (toAdd.length) {
        await prisma.userGroup.createMany({
          data: toAdd.map((gid) => ({ userId: id, groupId: gid })),
          skipDuplicates: true,
        });
      }

      if (toRemove.length) {
        await prisma.userGroup.deleteMany({
          where: { userId: id, groupId: { in: toRemove } },
        });
      }
    }

    revalidatePath("/admin/accounts");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour de l'utilisateur" 
    };
  }
}

// Supprimer un utilisateur
export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression de l'utilisateur" 
    };
  }
}

// Toggle le statut actif/inactif
export async function toggleUserStatus(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { 
        success: false, 
        error: "Utilisateur non trouvé" 
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });

    revalidatePath("/admin/accounts");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { 
      success: false, 
      error: "Erreur lors du changement de statut" 
    };
  }
}

// Récupérer tous les groupes actifs
export async function getActiveGroups() {
  try {
    const groups = await prisma.group.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return { success: true, data: groups };
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des groupes" 
    };
  }
}

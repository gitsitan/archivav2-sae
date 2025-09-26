"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface StructureFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  parentId?: number;
}

export interface StructureWithChildren {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  niveau: number;
  parentId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: StructureWithChildren[];
}

// Créer une structure
export async function createStructure(data: StructureFormData) {
  try {
    // Calculer le niveau basé sur le parent
    let niveau = 1;
    if (data.parentId) {
      const parent = await prisma.structure.findUnique({
        where: { id: data.parentId },
        select: { niveau: true }
      });
      if (parent) {
        niveau = parent.niveau + 1;
      }
    }

    const structure = await prisma.structure.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        parentId: data.parentId || null,
        niveau,
      },
    });

    revalidatePath("/parameters/structures");
    return { success: true, data: structure };
  } catch (error) {
    console.error("Erreur lors de la création de la structure:", error);
    return { 
      success: false, 
      error: "Erreur lors de la création de la structure" 
    };
  }
}

// Récupérer toutes les structures avec hiérarchie
export async function getStructures() {
  try {
    const structures = await prisma.structure.findMany({
      where: { parentId: null }, // Seulement les structures racines
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true // 3 niveaux de profondeur
              }
            }
          }
        }
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: structures };
  } catch (error) {
    console.error("Erreur lors de la récupération des structures:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des structures" 
    };
  }
}

// Récupérer toutes les structures pour sélection (flat list)
export async function getStructuresForSelection() {
  try {
    const structures = await prisma.structure.findMany({
      select: {
        id: true,
        name: true,
        niveau: true,
        parentId: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: structures };
  } catch (error) {
    console.error("Erreur lors de la récupération des structures:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des structures" 
    };
  }
}

// Récupérer une structure par ID
export async function getStructureById(id: number) {
  try {
    const structure = await prisma.structure.findUnique({
      where: { id },
    });

    if (!structure) {
      return { 
        success: false, 
        error: "Structure non trouvée" 
      };
    }

    return { success: true, data: structure };
  } catch (error) {
    console.error("Erreur lors de la récupération de la structure:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération de la structure" 
    };
  }
}

// Mettre à jour une structure
export async function updateStructure(id: number, data: StructureFormData) {
  try {
    // Calculer le niveau basé sur le parent
    let niveau = 1;
    if (data.parentId) {
      const parent = await prisma.structure.findUnique({
        where: { id: data.parentId },
        select: { niveau: true }
      });
      if (parent) {
        niveau = parent.niveau + 1;
      }
    }

    const structure = await prisma.structure.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        parentId: data.parentId || null,
        niveau,
      },
    });

    revalidatePath("/parameters/structures");
    return { success: true, data: structure };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la structure:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour de la structure" 
    };
  }
}

// Supprimer une structure
export async function deleteStructure(id: number) {
  try {
    await prisma.structure.delete({
      where: { id },
    });

    revalidatePath("/parameters/structures");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la structure:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression de la structure" 
    };
  }
}

// Toggle le statut actif/inactif
export async function toggleStructureStatus(id: number) {
  try {
    const structure = await prisma.structure.findUnique({
      where: { id },
    });

    if (!structure) {
      return { 
        success: false, 
        error: "Structure non trouvée" 
      };
    }

    const updatedStructure = await prisma.structure.update({
      where: { id },
      data: {
        isActive: !structure.isActive,
      },
    });

    revalidatePath("/parameters/structures");
    return { success: true, data: updatedStructure };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { 
      success: false, 
      error: "Erreur lors du changement de statut" 
    };
  }
}

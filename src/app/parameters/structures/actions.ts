"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface StructureFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Créer une structure
export async function createStructure(data: StructureFormData) {
  try {
    const structure = await prisma.structure.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
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

// Récupérer toutes les structures
export async function getStructures() {
  try {
    const structures = await prisma.structure.findMany({
      orderBy: { createdAt: "desc" },
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
    const structure = await prisma.structure.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
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

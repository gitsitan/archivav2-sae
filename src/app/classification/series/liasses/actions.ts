"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface LiasseFormData {
  name: string;
  description?: string;
  serieId: number;
  isActive: boolean;
}

export interface LiasseWithSerie {
  id: number;
  name: string;
  description: string | null;
  serieId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  serie: {
    id: number;
    name: string;
    code: string;
  } | null;
}

// Créer une liasse
export async function createLiasse(data: LiasseFormData) {
  try {
    const liasse = await prisma.liasse.create({
      data: {
        name: data.name,
        description: data.description || null,
        serieId: data.serieId,
        isActive: data.isActive,
      },
      include: {
        serie: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    revalidatePath("/classification/series");
    return { success: true, data: liasse };
  } catch (error) {
    console.error("Erreur lors de la création de la liasse:", error);
    return { 
      success: false, 
      error: "Erreur lors de la création de la liasse" 
    };
  }
}

// Récupérer toutes les liasses d'une série
export async function getLiassesBySerie(serieId: number) {
  try {
    const liasses = await prisma.liasse.findMany({
      where: { serieId },
      include: {
        serie: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: liasses };
  } catch (error) {
    console.error("Erreur lors de la récupération des liasses:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des liasses" 
    };
  }
}

// Récupérer une liasse par ID
export async function getLiasseById(id: number) {
  try {
    const liasse = await prisma.liasse.findUnique({
      where: { id },
      include: {
        serie: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!liasse) {
      return { 
        success: false, 
        error: "Liasse introuvable" 
      };
    }

    return { success: true, data: liasse };
  } catch (error) {
    console.error("Erreur lors de la récupération de la liasse:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération de la liasse" 
    };
  }
}

// Mettre à jour une liasse
export async function updateLiasse(id: number, data: LiasseFormData) {
  try {
    const updatedLiasse = await prisma.liasse.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        serieId: data.serieId,
        isActive: data.isActive,
      },
      include: {
        serie: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    revalidatePath("/classification/series");
    return { success: true, data: updatedLiasse };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la liasse:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour de la liasse" 
    };
  }
}

// Supprimer une liasse
export async function deleteLiasse(id: number) {
  try {
    // Vérifier s'il y a des documents associés
    const documentsCount = await prisma.document.count({
      where: { liasseId: id }
    });

    if (documentsCount > 0) {
      return { 
        success: false, 
        error: `Impossible de supprimer cette liasse car elle contient ${documentsCount} document(s). Supprimez d'abord les documents.` 
      };
    }

    await prisma.liasse.delete({
      where: { id }
    });

    revalidatePath("/classification/series");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la liasse:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression de la liasse" 
    };
  }
}

// Basculer le statut actif/inactif d'une liasse
export async function toggleLiasseStatus(id: number) {
  try {
    const liasse = await prisma.liasse.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!liasse) {
      return { 
        success: false, 
        error: "Liasse introuvable" 
      };
    }

    const updatedLiasse = await prisma.liasse.update({
      where: { id },
      data: { isActive: !liasse.isActive },
      include: {
        serie: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    revalidatePath("/classification/series");
    return { success: true, data: updatedLiasse };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { 
      success: false, 
      error: "Erreur lors du changement de statut" 
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SerieFormData {
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  dcl: number; // Durée de conservation légale
  dua: number; // Durée d'utilité administrative
  isActive: boolean;
}

export interface SerieWithChildren {
  id: number;
  code: string;
  name: string;
  description: string | null;
  parentId: number | null;
  level: number;
  dcl: number;
  dua: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: SerieWithChildren[];
}

// Créer une série
export async function createSerie(data: SerieFormData) {
  try {
    // Calculer le niveau automatiquement
    let level = 1;
    if (data.parentId) {
      const parent = await prisma.serie.findUnique({
        where: { id: data.parentId },
        select: { level: true }
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const serie = await prisma.serie.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null,
        level: level,
        dcl: data.dcl,
        dua: data.dua,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    revalidatePath("/classification/series");
    return { success: true, data: serie };
  } catch (error) {
    console.error("Erreur lors de la création de la série:", error);
    return { 
      success: false, 
      error: "Erreur lors de la création de la série" 
    };
  }
}

// Récupérer toutes les séries avec hiérarchie
export async function getSeries() {
  try {
    // Récupérer toutes les séries
    const allSeries = await prisma.serie.findMany({
      orderBy: [
        { level: "asc" },
        { name: "asc" }
      ],
    });

    // Construire la hiérarchie
    const seriesMap = new Map<number, SerieWithChildren>();
    const rootSeries: SerieWithChildren[] = [];

    // Créer un map de toutes les séries
    allSeries.forEach(serie => {
      seriesMap.set(serie.id, {
        ...serie,
        children: []
      });
    });

    // Construire l'arbre
    allSeries.forEach(serie => {
      const serieWithChildren = seriesMap.get(serie.id)!;
      
      if (serie.parentId) {
        const parent = seriesMap.get(serie.parentId);
        if (parent) {
          parent.children.push(serieWithChildren);
        }
      } else {
        rootSeries.push(serieWithChildren);
      }
    });

    return { success: true, data: rootSeries };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des séries" 
    };
  }
}

// Récupérer une série par ID
export async function getSerieById(id: number) {
  try {
    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!serie) {
      return { 
        success: false, 
        error: "Série non trouvée" 
      };
    }

    return { success: true, data: serie };
  } catch (error) {
    console.error("Erreur lors de la récupération de la série:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération de la série" 
    };
  }
}

// Mettre à jour une série
export async function updateSerie(id: number, data: SerieFormData) {
  try {
    // Calculer le niveau automatiquement
    let level = 1;
    if (data.parentId) {
      const parent = await prisma.serie.findUnique({
        where: { id: data.parentId },
        select: { level: true }
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const updatedSerie = await prisma.serie.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        parentId: data.parentId || null,
        level: level,
        dcl: data.dcl,
        dua: data.dua,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    revalidatePath("/classification/series");
    return { success: true, data: updatedSerie };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la série:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour de la série" 
    };
  }
}

// Supprimer une série
export async function deleteSerie(id: number) {
  try {
    // Vérifier s'il y a des enfants
    const children = await prisma.serie.findMany({
      where: { parentId: id }
    });

    if (children.length > 0) {
      return {
        success: false,
        error: "Impossible de supprimer cette série car elle contient des sous-séries"
      };
    }

    await prisma.serie.delete({
      where: { id },
    });

    revalidatePath("/classification/series");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la série:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression de la série" 
    };
  }
}

// Toggle le statut actif/inactif
export async function toggleSerieStatus(id: number) {
  try {
    const serie = await prisma.serie.findUnique({
      where: { id },
    });

    if (!serie) {
      return { 
        success: false, 
        error: "Série non trouvée" 
      };
    }

    const updatedSerie = await prisma.serie.update({
      where: { id },
      data: {
        isActive: !serie.isActive,
      },
    });

    revalidatePath("/classification/series");
    return { success: true, data: updatedSerie };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { 
      success: false, 
      error: "Erreur lors du changement de statut" 
    };
  }
}

// Récupérer les séries parentes (pour les dropdowns)
export async function getParentSeries() {
  try {
    const parentSeries = await prisma.serie.findMany({
      where: { 
        isActive: true,
        parentId: null // Séries racines uniquement
      },
      select: { id: true, name: true, code: true, level: true },
      orderBy: { name: "asc" }
    });

    return { success: true, data: parentSeries };
  } catch (error) {
    console.error("Erreur lors de la récupération des séries parentes:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des séries parentes" 
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface LocalisationFormData {
  code: string;
  name: string;
  parentId?: number;
  isActive: boolean;
}

export interface LocalisationWithChildren {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: LocalisationWithChildren[];
}

export interface LocalisationWithParent {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: { id: number; name: string; code: string } | null;
}

const MAX_LEVEL = 5;

// Créer une localisation
export async function createLocalisation(data: LocalisationFormData) {
  try {
    // Vérifier le niveau maximum
    if (data.parentId) {
      const parent = await prisma.localisation.findUnique({
        where: { id: data.parentId },
        select: { level: true },
      });

      if (parent && parent.level >= MAX_LEVEL) {
        return {
          success: false,
          error: `Impossible de créer une localisation : le niveau maximum (${MAX_LEVEL}) serait dépassé.`,
        };
      }
    }

    // Calculer le niveau automatiquement
    let level = 1;
    if (data.parentId) {
      const parent = await prisma.localisation.findUnique({
        where: { id: data.parentId },
        select: { level: true },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const localisation = await prisma.localisation.create({
      data: {
        code: data.code,
        name: data.name,
        parentId: data.parentId || null,
        level: level,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    revalidatePath("/classification/adressage");
    return { success: true, data: localisation };
  } catch (error) {
    console.error("Erreur lors de la création de la localisation:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la localisation",
    };
  }
}

// Récupérer toutes les localisations avec hiérarchie
export async function getLocalisations() {
  try {
    const localisations = await prisma.localisation.findMany({
      where: { parentId: null }, // Seulement les racines
      include: {
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Convertir les données pour correspondre au type LocalisationWithChildren
    const convertToLocalisationWithChildren = (
      item: any
    ): LocalisationWithChildren => ({
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      level: item.level,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      children: item.children
        ? item.children.map(convertToLocalisationWithChildren)
        : [],
    });

    const convertedLocalisations = localisations.map(
      convertToLocalisationWithChildren
    );

    return { success: true, data: convertedLocalisations };
  } catch (error) {
    console.error("Erreur lors de la récupération des localisations:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des localisations",
    };
  }
}

// Récupérer une localisation par ID
export async function getLocalisationById(id: number) {
  try {
    const localisation = await prisma.localisation.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!localisation) {
      return {
        success: false,
        error: "Localisation introuvable",
      };
    }

    return { success: true, data: localisation };
  } catch (error) {
    console.error("Erreur lors de la récupération de la localisation:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la localisation",
    };
  }
}

// Mettre à jour une localisation
export async function updateLocalisation(
  id: number,
  data: LocalisationFormData
) {
  try {
    // Vérifier le niveau maximum si on change le parent
    if (data.parentId) {
      const parent = await prisma.localisation.findUnique({
        where: { id: data.parentId },
        select: { level: true },
      });

      if (parent && parent.level >= MAX_LEVEL) {
        return {
          success: false,
          error: `Impossible de modifier la localisation : le niveau maximum (${MAX_LEVEL}) serait dépassé.`,
        };
      }
    }

    // Calculer le niveau automatiquement
    let level = 1;
    if (data.parentId) {
      const parent = await prisma.localisation.findUnique({
        where: { id: data.parentId },
        select: { level: true },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const updatedLocalisation = await prisma.localisation.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        parentId: data.parentId || null,
        level: level,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    revalidatePath("/classification/adressage");
    return { success: true, data: updatedLocalisation };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la localisation:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la localisation",
    };
  }
}

// Supprimer une localisation
export async function deleteLocalisation(id: number) {
  try {
    // Vérifier s'il y a des enfants
    const childrenCount = await prisma.localisation.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette localisation car elle contient ${childrenCount} sous-localisation(s). Supprimez d'abord les sous-localisations.`,
      };
    }

    // Vérifier s'il y a des dossiers associés
    const dossiersCount = await prisma.dossier.count({
      where: { localisationId: id },
    });

    if (dossiersCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette localisation car elle contient ${dossiersCount} dossier(s). Supprimez d'abord les dossiers.`,
      };
    }

    await prisma.localisation.delete({
      where: { id },
    });

    revalidatePath("/classification/adressage");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la localisation:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la localisation",
    };
  }
}

// Basculer le statut actif/inactif d'une localisation
export async function toggleLocalisationStatus(id: number) {
  try {
    const localisation = await prisma.localisation.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!localisation) {
      return {
        success: false,
        error: "Localisation introuvable",
      };
    }

    const updatedLocalisation = await prisma.localisation.update({
      where: { id },
      data: { isActive: !localisation.isActive },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    revalidatePath("/classification/adressage");
    return { success: true, data: updatedLocalisation };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return {
      success: false,
      error: "Erreur lors du changement de statut",
    };
  }
}

// Récupérer les localisations parentes (pour les formulaires)
export async function getParentLocalisations() {
  try {
    const localisations = await prisma.localisation.findMany({
      where: {
        isActive: true,
        level: { lt: MAX_LEVEL }, // Seulement les niveaux < MAX_LEVEL
      },
      select: { id: true, name: true, code: true, level: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: localisations };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des localisations parentes:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des localisations parentes",
    };
  }
}

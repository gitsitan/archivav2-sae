"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export enum BeneficiaryType {
  INDIVIDUAL = "INDIVIDUAL",
  ORGANIZATION = "ORGANIZATION", 
  GOVERNMENT = "GOVERNMENT",
  PRIVATE = "PRIVATE"
}

export interface BeneficiaryFormData {
  name: string;
  type: BeneficiaryType;
  contact?: string;
  address?: string;
}

// Créer un bénéficiaire
export async function createBeneficiary(data: BeneficiaryFormData) {
  try {
    const beneficiary = await prisma.beneficiaire.create({
      data: {
        name: data.name,
        type: data.type,
        contact: data.contact || null,
        address: data.address || null,
      },
    });

    revalidatePath("/parameters/beneficiaires");
    return { success: true, data: beneficiary };
  } catch (error) {
    console.error("Erreur lors de la création du bénéficiaire:", error);
    return { 
      success: false, 
      error: "Erreur lors de la création du bénéficiaire" 
    };
  }
}

// Récupérer tous les bénéficiaires
export async function getBeneficiaries() {
  try {
    const beneficiaries = await prisma.beneficiaire.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: beneficiaries };
  } catch (error) {
    console.error("Erreur lors de la récupération des bénéficiaires:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des bénéficiaires" 
    };
  }
}

// Récupérer un bénéficiaire par ID
export async function getBeneficiaryById(id: number) {
  try {
    const beneficiary = await prisma.beneficiaire.findUnique({
      where: { id },
    });

    if (!beneficiary) {
      return { 
        success: false, 
        error: "Bénéficiaire non trouvé" 
      };
    }

    return { success: true, data: beneficiary };
  } catch (error) {
    console.error("Erreur lors de la récupération du bénéficiaire:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération du bénéficiaire" 
    };
  }
}

// Mettre à jour un bénéficiaire
export async function updateBeneficiary(id: number, data: BeneficiaryFormData) {
  try {
    const beneficiary = await prisma.beneficiaire.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        contact: data.contact || null,
        address: data.address || null,
      },
    });

    revalidatePath("/parameters/beneficiaires");
    return { success: true, data: beneficiary };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bénéficiaire:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour du bénéficiaire" 
    };
  }
}

// Supprimer un bénéficiaire
export async function deleteBeneficiary(id: number) {
  try {
    await prisma.beneficiaire.delete({
      where: { id },
    });

    revalidatePath("/parameters/beneficiaires");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du bénéficiaire:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression du bénéficiaire" 
    };
  }
}

// Toggle le statut actif/inactif
export async function toggleBeneficiaryStatus(id: number) {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
    });

    if (!beneficiary) {
      return { 
        success: false, 
        error: "Bénéficiaire non trouvé" 
      };
    }

    const updatedBeneficiary = await prisma.beneficiaire.update({
      where: { id },
      data: {
        isActive: !beneficiary.isActive,
      },
    });

    revalidatePath("/parameters/beneficiaires");
    return { success: true, data: updatedBeneficiary };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { 
      success: false, 
      error: "Erreur lors du changement de statut" 
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TypeDocumentFormData {
  name: string;
  status?: "ACTIVE" | "ARCHIVED" | "DESTROYED";
}

export interface TypeDocumentItem {
  id: number;
  name: string;
  status: "ACTIVE" | "ARCHIVED" | "DESTROYED";
  createdAt: Date;
  updatedAt: Date;
}

export async function createTypeDocument(data: TypeDocumentFormData) {
  try {
    const item = await prisma.typeDocument.create({
      data: {
        name: data.name,
        status: (data.status || "ACTIVE") as any,
      },
    });
    revalidatePath("/classification/types-documents");
    return { success: true, data: item };
  } catch (error) {
    console.error("Erreur lors de la création du type de document:", error);
    return {
      success: false,
      error: "Erreur lors de la création du type de document",
    };
  }
}

export async function getTypeDocuments() {
  try {
    const items = await prisma.typeDocument.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return { success: true, data: items as TypeDocumentItem[] };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types de document:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la récupération des types de document",
    };
  }
}

export async function getTypeDocumentById(id: number) {
  try {
    const item = await prisma.typeDocument.findUnique({ where: { id } });
    if (!item) {
      return { success: false, error: "Type de document non trouvé" };
    }
    return { success: true, data: item as TypeDocumentItem };
  } catch (error) {
    console.error("Erreur lors de la récupération du type de document:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du type de document",
    };
  }
}

export async function updateTypeDocument(
  id: number,
  data: TypeDocumentFormData
) {
  try {
    const updated = await prisma.typeDocument.update({
      where: { id },
      data: {
        name: data.name,
        status: (data.status || "ACTIVE") as any,
      },
    });
    revalidatePath("/classification/types-documents");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type de document:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du type de document",
    };
  }
}

export async function deleteTypeDocument(id: number) {
  try {
    // Vérifier s'il existe des documents associés
    const count = await prisma.document.count({ where: { typeId: id } });
    if (count > 0) {
      return {
        success: false,
        error: "Impossible de supprimer: des documents y sont associés",
      };
    }

    await prisma.typeDocument.delete({ where: { id } });
    revalidatePath("/classification/types-documents");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du type de document:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du type de document",
    };
  }
}

export async function toggleTypeDocumentStatus(id: number) {
  try {
    const item = await prisma.typeDocument.findUnique({ where: { id } });
    if (!item) {
      return { success: false, error: "Type de document non trouvé" };
    }
    const nextStatus = item.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    const updated = await prisma.typeDocument.update({
      where: { id },
      data: { status: nextStatus as any },
    });
    revalidatePath("/classification/types-documents");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return { success: false, error: "Erreur lors du changement de statut" };
  }
}

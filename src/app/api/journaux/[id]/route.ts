/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFile = path.join(process.cwd(), "public", "data", "journaux.json");

// Gère la requête GET pour récupérer un seul journal par son ID.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const journalId = parseInt(id, 10);

    if (isNaN(journalId)) {
      return NextResponse.json({ message: "ID invalide." }, { status: 400 });
    }

    const json = await fs.readFile(dataFile, "utf-8");
    const journals = JSON.parse(json);

    const journal = journals.find((j: any) => j.id === journalId);

    if (journal) {
      return NextResponse.json(journal);
    } else {
      return NextResponse.json(
        { message: "Journal non trouvé." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur de l'API GET:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// Gère la requête PUT pour mettre à jour un journal existant.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedJournalData = await request.json();
    const { id } = params;

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ message: "ID invalide." }, { status: 400 });
    }

    const json = await fs.readFile(dataFile, "utf-8");
    const journals = JSON.parse(json);

    const journalIndex = journals.findIndex(
      (journal: any) => journal.id === parseInt(id, 10)
    );

    if (journalIndex !== -1) {
      // Fusionne les données existantes avec les nouvelles données
      journals[journalIndex] = {
        ...journals[journalIndex],
        ...updatedJournalData,
      };

      await fs.writeFile(dataFile, JSON.stringify(journals, null, 2));
      return NextResponse.json(journals[journalIndex]);
    }

    return NextResponse.json(
      { message: "Journal non trouvé." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Erreur de mise à jour du journal:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du journal." },
      { status: 500 }
    );
  }
}
// Gère la requête DELETE pour supprimer un journal existant.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const journalId = parseInt(id, 10);

    if (isNaN(journalId)) {
      return NextResponse.json({ message: "ID invalide." }, { status: 400 });
    }

    const json = await fs.readFile(dataFile, "utf-8");
    let journals = JSON.parse(json);

    const initialLength = journals.length;
    journals = journals.filter((journal: any) => journal.id !== journalId);

    if (journals.length < initialLength) {
      await fs.writeFile(dataFile, JSON.stringify(journals, null, 2));
      return NextResponse.json(
        { message: "Journal supprimé avec succès." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Journal non trouvé." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du journal:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur lors de la suppression." },
      { status: 500 }
    );
  }
}

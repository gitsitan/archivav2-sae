/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFile = path.join(process.cwd(), "public", "data", "journaux.json");

// Gère la requête GET pour obtenir tous les journaux.
export async function GET() {
  try {
    const json = await fs.readFile(dataFile, "utf-8");
    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    console.error("Erreur de lecture du fichier:", error);
    return NextResponse.json(
      { message: "Erreur de chargement des journaux." },
      { status: 500 }
    );
  }
}

// Gère la requête POST pour créer un nouveau journal.
export async function POST(request: Request) {
  try {
    const newJournal = await request.json();
    const json = await fs.readFile(dataFile, "utf-8");
    const journals = JSON.parse(json);

    // Attribution d'un ID unique. L'ID est soit le max actuel + 1, soit 1 si le tableau est vide.
    const newId =
      journals.length > 0 ? Math.max(...journals.map((j: any) => j.id)) + 1 : 1;
    const journalWithId = { ...newJournal, id: newId };

    journals.push(journalWithId);
    await fs.writeFile(dataFile, JSON.stringify(journals, null, 2));
    return NextResponse.json(journalWithId, { status: 201 });
  } catch (error) {
    console.error("Erreur de création du journal:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du journal." },
      { status: 500 }
    );
  }
}

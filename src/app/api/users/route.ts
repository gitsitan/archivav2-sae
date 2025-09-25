import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      groups: {
        include: { group: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  // Map pour aplatir les groupes
  const mapped = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    groupIds: u.groups.map((ug) => ug.group.id),
    groupNames: u.groups.map((ug) => ug.group.name),
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const data = await request.json();
  const { email, name, role, isActive, groupIds } = data as {
    email: string;
    name?: string | null;
    role?: "ADMIN" | "MANAGER" | "USER" | "VIEWER";
    isActive?: boolean;
    groupIds?: number[];
  };

  const created = await prisma.user.create({
    data: {
      email,
      // Mot de passe par défaut pour satisfaire la contrainte NOT NULL côté DB
      // (à remplacer par une vraie gestion d’auth plus tard)
      password: "changeme",
      name: typeof name === "undefined" ? undefined : name,
      role: typeof role === "undefined" ? undefined : role,
      isActive: typeof isActive === "undefined" ? undefined : isActive,
      groups:
        groupIds && groupIds.length
          ? {
              create: groupIds.map((gid) => ({
                group: { connect: { id: gid } },
              })),
            }
          : undefined,
    },
    include: { groups: { include: { group: true } } },
  });

  return NextResponse.json({
    id: created.id,
    email: created.email,
    name: created.name ?? null,
    role: created.role,
    isActive: created.isActive,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    groupIds: created.groups.map((g) => g.groupId),
    groupNames: created.groups.map((g) => g.group.name),
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, isActive, groupIds } = body as {
      id: number;
      name?: string | null;
      role?: "ADMIN" | "MANAGER" | "USER" | "VIEWER";
      isActive?: boolean;
      groupIds?: number[];
    };

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Paramètre 'id' manquant ou invalide" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (typeof name !== "undefined") data.name = name;
    if (typeof role !== "undefined") data.role = role;
    if (typeof isActive !== "undefined") data.isActive = isActive;

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({ where: { id }, data });

    // Synchroniser les groupes si fournis
    if (Array.isArray(groupIds)) {
      // Récupérer existants
      const existing = await prisma.userGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const existingIds = new Set(existing.map((e) => e.groupId));
      const targetIds = new Set(groupIds);

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

    const withGroups = await prisma.user.findUnique({
      where: { id },
      include: { groups: { include: { group: true } } },
    });

    return NextResponse.json({
      ...withGroups,
      groupIds: withGroups?.groups.map((g) => g.groupId) ?? [],
      groupNames: withGroups?.groups.map((g) => g.group.name) ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

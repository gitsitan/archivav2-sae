"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Typage pour les résultats des actions
type ActionResponse<T> = {
  success: boolean;
  data?: T | null;
  error?: string;
};

// Interface pour les filtres d'audit
export interface AuditFilters {
  userId?: number;
  action?: string;
  entity?: string;
  entityId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  search?: string;
}

// Interface pour les données d'audit avec utilisateur
export interface AuditLogWithUser {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

// Fonction pour récupérer les logs d'audit avec filtres
export async function getAuditLogs(
  filters: AuditFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<ActionResponse<{ logs: AuditLogWithUser[]; total: number; totalPages: number }>> {
  try {
    const skip = (page - 1) * limit;
    
    // Construction des conditions de filtrage
    const where: any = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.action) {
      where.action = {
        contains: filters.action,
        mode: 'insensitive'
      };
    }
    
    if (filters.entity) {
      where.entity = {
        contains: filters.entity,
        mode: 'insensitive'
      };
    }
    
    if (filters.entityId) {
      where.entityId = filters.entityId;
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }
    
    if (filters.ipAddress) {
      where.ipAddress = {
        contains: filters.ipAddress,
        mode: 'insensitive'
      };
    }
    
    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // Récupération des logs avec pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        logs: logs as AuditLogWithUser[],
        total,
        totalPages
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logs d'audit:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des logs d'audit."
    };
  }
}

// Fonction pour récupérer les utilisateurs pour le filtre
export async function getUsersForFilter(): Promise<ActionResponse<{ id: number; name: string | null; email: string }[]>> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des utilisateurs."
    };
  }
}

// Fonction pour récupérer les actions uniques
export async function getUniqueActions(): Promise<ActionResponse<string[]>> {
  try {
    const actions = await prisma.auditLog.findMany({
      select: {
        action: true
      },
      distinct: ['action'],
      orderBy: {
        action: 'asc'
      }
    });

    return {
      success: true,
      data: actions.map(a => a.action)
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des actions:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des actions."
    };
  }
}

// Fonction pour récupérer les entités uniques
export async function getUniqueEntities(): Promise<ActionResponse<string[]>> {
  try {
    const entities = await prisma.auditLog.findMany({
      select: {
        entity: true
      },
      distinct: ['entity'],
      orderBy: {
        entity: 'asc'
      }
    });

    return {
      success: true,
      data: entities.map(e => e.entity)
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des entités:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des entités."
    };
  }
}

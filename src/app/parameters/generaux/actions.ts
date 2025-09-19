"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GeneralSettings, SettingCategory, OptionItem } from "@/types/general-settings";

// Récupérer tous les paramètres généraux
export async function getGeneralSettings() {
  try {
    const options = await prisma.options.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });

    // Organiser les paramètres par catégorie
    const settings: Partial<GeneralSettings> = {};
    
    options.forEach((option) => {
      const category = option.category as SettingCategory;
      if (!settings[category]) {
        settings[category] = {};
      }
      settings[category][option.key] = option.value;
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return { 
      success: false, 
      error: "Erreur lors de la récupération des paramètres" 
    };
  }
}

// Récupérer les paramètres par catégorie
export async function getSettingsByCategory(category: SettingCategory) {
  try {
    const options = await prisma.options.findMany({
      where: { 
        category,
        isActive: true 
      },
    });

    const settings: Record<string, any> = {};
    options.forEach((option) => {
      settings[option.key] = option.value;
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error(`Erreur lors de la récupération des paramètres ${category}:`, error);
    return { 
      success: false, 
      error: `Erreur lors de la récupération des paramètres ${category}` 
    };
  }
}

// Mettre à jour un paramètre spécifique
export async function updateSetting(category: SettingCategory, key: string, value: any) {
  try {
    const option = await prisma.options.upsert({
      where: { key },
      update: {
        value,
        category,
        updatedAt: new Date(),
      },
      create: {
        key,
        value,
        category,
        isActive: true,
      },
    });

    revalidatePath("/parameters/generaux");
    return { success: true, data: option };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paramètre:", error);
    return { 
      success: false, 
      error: "Erreur lors de la mise à jour du paramètre" 
    };
  }
}

// Mettre à jour plusieurs paramètres d'une catégorie
export async function updateCategorySettings(category: SettingCategory, settings: Record<string, any>) {
  try {
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const option = await prisma.options.upsert({
        where: { key },
        update: {
          value,
          category,
          updatedAt: new Date(),
        },
        create: {
          key,
          value,
          category,
          isActive: true,
        },
      });
      results.push(option);
    }

    revalidatePath("/parameters/generaux");
    return { success: true, data: results };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des paramètres ${category}:`, error);
    return { 
      success: false, 
      error: `Erreur lors de la mise à jour des paramètres ${category}` 
    };
  }
}

// Supprimer un paramètre
export async function deleteSetting(key: string) {
  try {
    await prisma.options.update({
      where: { key },
      data: { isActive: false },
    });

    revalidatePath("/parameters/generaux");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du paramètre:", error);
    return { 
      success: false, 
      error: "Erreur lors de la suppression du paramètre" 
    };
  }
}

// Initialiser les paramètres par défaut
export async function initializeDefaultSettings() {
  try {
    const defaultSettings = {
      company: {
        name: "Archiva SAE",
        address: "",
        phone: "",
        email: "",
        website: "",
        logo: "",
      },
      storage: {
        path: "./storage",
        maxFileSize: 100,
        allowedExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".png"],
        backupEnabled: true,
        backupPath: "./backups",
      },
      session: {
        timeout: 30,
        maxConcurrentSessions: 5,
        rememberMeDuration: 30,
        requirePasswordChange: false,
        passwordChangeInterval: 90,
      },
      security: {
        enableTwoFactor: false,
        passwordMinLength: 8,
        requireSpecialChars: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        systemNotifications: true,
        emailSmtpHost: "",
        emailSmtpPort: 587,
        emailSmtpUser: "",
        emailSmtpPassword: "",
      },
    };

    const results = [];
    
    for (const [category, settings] of Object.entries(defaultSettings)) {
      for (const [key, value] of Object.entries(settings)) {
        const option = await prisma.options.upsert({
          where: { key },
          update: {},
          create: {
            key,
            value,
            category,
            isActive: true,
          },
        });
        results.push(option);
      }
    }

    revalidatePath("/parameters/generaux");
    return { success: true, data: results };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des paramètres par défaut:", error);
    return { 
      success: false, 
      error: "Erreur lors de l'initialisation des paramètres par défaut" 
    };
  }
}

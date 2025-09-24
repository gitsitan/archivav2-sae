// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

import menuData from "./data/menus.json";


const prisma = new PrismaClient();

async function seedMenus() {
//   await prisma.menuItem.deleteMany({});
//   await prisma.menu.deleteMany({}); // Supprimer tous les menus existants
//   for (const menu of menuData) {
//     // Find existing menu by title (assuming title is not unique in the schema)
//     let createdMenu = await prisma.menu.findFirst({
//       where: { title: menu.title },
//     });

//     if (!createdMenu) {
//       createdMenu = await prisma.menu.create({
//         data: {
//           title: menu.title,
//           url: menu.url,
//           icon: menu.icon,
//         },
//       });

//       for (const item of menu.items) {
//         let createdMenuItem = await prisma.menuItem.findFirst({
//           where: { title: menu.title, menuId: createdMenu.id },
//         });
//         if (!createdMenuItem) {
//           createdMenuItem = await prisma.menuItem.create({
//             data: {
//               title: item.title,
//               url: item.url,
//               menuId: createdMenu.id,
//             },
//           });
//         }
//       }
//     }
//   }
}

async function seedUsers() {
  console.log("🌱 Seeding users...");
  
  // Clear existing users (except if you want to keep some)
  // await prisma.user.deleteMany({});
  
  const users = [
    {
      email: "admin@archiva.td",
      name: "Administrateur Principal",
      role: "ADMIN" as const,
      isActive: true
    },
    {
      email: "manager@archiva.td", 
      name: "Gestionnaire Archives",
      role: "MANAGER" as const,
      isActive: true
    },
    {
      email: "archiviste1@archiva.td",
      name: "Archiviste Principal",
      role: "USER" as const,
      isActive: true
    },
    {
      email: "archiviste2@archiva.td",
      name: "Archiviste Secondaire", 
      role: "USER" as const,
      isActive: true
    },
    {
      email: "consultant@archiva.td",
      name: "Consultant Externe",
      role: "VIEWER" as const,
      isActive: true
    },
    {
      email: "stagiaire@archiva.td",
      name: "Stagiaire Archives",
      role: "VIEWER" as const,
      isActive: false
    }
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: userData
      });
      console.log(`✅ User created: ${userData.email}`);
    } else {
      console.log(`⚠️  User already exists: ${userData.email}`);
    }
  }
}

async function seedGroups() {
  console.log("🌱 Seeding groups...");
  
  // Clear existing groups
  // await prisma.group.deleteMany({});
  
  const groups = [
    {
      name: "Super Administrateurs",
      description: "Groupe avec tous les droits d'administration du système",
      permissions: [
        "dossiers.write",
        "dossiers.versement.write",
        "dossiers.destruction.write",
        "classification.series.write",
        "classification.adressage.write",
        "classification.types-documents.write",
        "parameters.structures.write",
        "parameters.beneficiaires.write",
        "parameters.types-dossier.write",
        "parameters.generaux.write"
      ],
      autorisations: {
        
      },
      isAdmin: true,
      isActive: true
    },
    {
      name: "Gestionnaires Archives",
      description: "Gestionnaires des archives avec droits étendus",
      permissions: [

      ],
      autorisations: {
       
      },
      isAdmin: false,
      isActive: true
    },
    {
      name: "Archivistes",
      description: "Archivistes avec droits de gestion des dossiers",
      permissions: [

      ],
      autorisations: {
      
      },
      isAdmin: false,
      isActive: true
    },
    {
      name: "Consultants",
      description: "Consultants avec accès en lecture seule",
      permissions: [
       
      ],
      autorisations: {
       
      },
      isAdmin: false,
      isActive: true
    },
    {
      name: "Stagiaires",
      description: "Stagiaires avec accès limité",
      permissions: [

      ],
      autorisations: {
    
      },
      isAdmin: false,
      isActive: false
    }
  ];

  for (const groupData of groups) {
    const existingGroup = await prisma.group.findUnique({
      where: { name: groupData.name }
    });

    if (!existingGroup) {
      await prisma.group.create({
        data: groupData
      });
      console.log(`✅ Group created: ${groupData.name}`);
    } else {
      console.log(`⚠️  Group already exists: ${groupData.name}`);
    }
  }
}

async function seedUserGroups() {
  console.log("🌱 Seeding user-group relationships...");
  
  // Clear existing user-group relationships
  // await prisma.userGroup.deleteMany({});
  
  // Get all users and groups
  const users = await prisma.user.findMany();
  const groups = await prisma.group.findMany();
  
  // Create user-group relationships
  const userGroupRelations = [
    // Super Admin gets all groups
    { userEmail: "admin@archiva.td", groupName: "Super Administrateurs" },
    
    // Manager gets management groups
    { userEmail: "manager@archiva.td", groupName: "Gestionnaires Archives" },
    { userEmail: "manager@archiva.td", groupName: "Archivistes" },
    
    // Archivistes get their specific groups
    { userEmail: "archiviste1@archiva.td", groupName: "Archivistes" },
    { userEmail: "archiviste2@archiva.td", groupName: "Archivistes" },
    
    // Consultant gets read-only access
    { userEmail: "consultant@archiva.td", groupName: "Consultants" },
    
    // Stagiaire gets limited access
    { userEmail: "stagiaire@archiva.td", groupName: "Stagiaires" }
  ];

  for (const relation of userGroupRelations) {
    const user = users.find(u => u.email === relation.userEmail);
    const group = groups.find(g => g.name === relation.groupName);
    
    if (user && group) {
      const existingRelation = await prisma.userGroup.findFirst({
        where: {
          userId: user.id,
          groupId: group.id
        }
      });

      if (!existingRelation) {
        await prisma.userGroup.create({
          data: {
            userId: user.id,
            groupId: group.id
          }
        });
        console.log(`✅ User-Group relation created: ${user.email} -> ${group.name}`);
      } else {
        console.log(`⚠️  User-Group relation already exists: ${user.email} -> ${group.name}`);
      }
    } else {
      console.log(`❌ Could not find user or group for relation: ${relation.userEmail} -> ${relation.groupName}`);
    }
  }
}

async function seedPermissions() {
  console.log("🌱 Seeding permissions...");
  
  // This function can be used to seed additional permission data if needed
  // For now, permissions are handled through the JSON files
  console.log("✅ Permissions are managed through JSON files");
}


async function main() {
  console.log("🚀 Starting database seeding...");
  
  try {
    // Seed in order: Users first, then Groups, then UserGroups
    await seedUsers();
    await seedGroups();
    await seedUserGroups();
    await seedPermissions();

    console.log("✅ Seed terminé avec succès.");
  } catch (error) {
    console.error("❌ Erreur durant le seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
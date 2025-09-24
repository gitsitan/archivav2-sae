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

async function seedPermissions() {

}


async function main() {

  await seedPermissions();

  console.log("Seed terminé avec succès.");
}

main()
  .catch((e) => {
    console.error("Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const categories = ["Entertainment", "Household"];
  // Default
  for (const category of categories) {
    await prisma.defaultCategory.upsert({
      where: { name: category },
      update: {},
      create: {
        name: category,
      },
    });
  }

  console.log("✅ Seeded database with default categories template");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Usage: npx tsx scripts/make-admin.ts <phone-or-email>");
    process.exit(1);
  }
  const user = await prisma.user.findFirst({ where: { OR: [{ phone: identifier }, { email: identifier }] } });
  if (!user) {
    console.error(`No user found for ${identifier}. Log in once first, then run this script.`);
    process.exit(1);
  }
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  console.log(`${identifier} is now an admin.`);
}

main().finally(() => prisma.$disconnect());

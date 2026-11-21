// One-off: replaces the generic colored-block placeholder SVGs with real
// stock photography (lib/images.ts) on existing Tour rows, in place.
// Safe to run against a live database — only updates Tour.heroImage and
// Tour.gallery; touches no other table (groups, bookings, votes, etc. are
// left untouched).
import { PrismaClient } from "@prisma/client";
import { tourPhoto, tourGallery } from "../lib/images";

const prisma = new PrismaClient();

async function main() {
  const tours = await prisma.tour.findMany({ select: { id: true, slug: true } });
  console.log(`Updating hero/gallery images for ${tours.length} tours...`);

  for (const tour of tours) {
    await prisma.tour.update({
      where: { id: tour.id },
      data: {
        heroImage: tourPhoto(tour.slug),
        gallery: tourGallery(tour.slug).join(","),
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// One-off: replaces tour hero/gallery images with real, destination-matched
// stock photos (lib/tour-photos.ts) on existing Tour rows, in place.
// Safe to run against a live database — only updates Tour.heroImage and
// Tour.gallery; touches no other table (groups, bookings, votes, etc. are
// left untouched).
import { PrismaClient } from "@prisma/client";
import { TOUR_PHOTOS, tourPhotoUrl } from "../lib/tour-photos";

const prisma = new PrismaClient();

async function main() {
  const tours = await prisma.tour.findMany({ select: { id: true, title: true } });
  console.log(`Updating hero/gallery images for ${tours.length} tours...`);

  for (const tour of tours) {
    const photos = TOUR_PHOTOS[tour.title];
    if (!photos) {
      console.warn(`No photo mapping for "${tour.title}" — skipped`);
      continue;
    }
    const [hero, ...gallery] = photos;
    await prisma.tour.update({
      where: { id: tour.id },
      data: {
        heroImage: tourPhotoUrl(hero),
        gallery: gallery.map((g) => tourPhotoUrl(g)).join(","),
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

// Deterministic real stock photography via Lorem Picsum — no API key, no
// guessing at asset ids that might not exist. Same seed always returns the
// same photo, so a tour's hero/gallery images stay stable across reseeds.
export function tourPhoto(seed: string, width = 800, height = 500): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

export function tourGallery(slug: string, count = 3): string[] {
  return Array.from({ length: count }, (_, i) => tourPhoto(`${slug}-${i + 1}`));
}

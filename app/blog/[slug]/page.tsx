import { notFound } from "next/navigation";

const POSTS: Record<string, { title: string; body: string[] }> = {
  "packing-list-himalayan-trek": {
    title: "A packing list for your first Himalayan trek",
    body: [
      "Most first-time trekkers overpack clothes and underpack for cold nights. For a beginner trek like Kedarkantha, prioritise a good pair of broken-in trekking shoes, thermal base layers, a windproof outer shell, and a 0°C-rated sleeping bag if you're camping.",
      "Carry a headlamp rather than a phone torch, a reusable water bottle, and basic blister care. Your trek operator's gear list on the tour page is tour-specific — always check it rather than relying on a generic list.",
    ],
  },
  "char-dham-yatra-for-seniors": {
    title: "Planning a Char Dham Yatra for senior citizens",
    body: [
      "The steepest part of most Char Dham itineraries is the walk up to Kedarnath. Pony, palki and helicopter options exist at every dham and can be arranged locally — ask your tour manager for current rates before you go.",
      "Build in acclimatisation time, avoid over-packing the itinerary with same-day darshans at multiple dhams, and carry any regular medication clearly labelled.",
    ],
  },
  "understanding-tcs-international-travel": {
    title: "Understanding TCS on international tour packages",
    body: [
      "Tax Collected at Source (TCS) on overseas tour packages is collected by us at the rate set by the government and shown separately on your invoice — it is not an extra fee we keep.",
      "You can claim this TCS amount as a credit against your income tax liability when filing your return. Speak to your tax advisor for how this applies to your specific situation.",
    ],
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <article className="prose max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">{post.title}</h1>
      {post.body.map((p, i) => (
        <p key={i} className="mt-4 text-foreground-muted">{p}</p>
      ))}
    </article>
  );
}

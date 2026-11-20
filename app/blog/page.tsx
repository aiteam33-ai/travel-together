import Link from "next/link";

const POSTS = [
  { slug: "packing-list-himalayan-trek", title: "A packing list for your first Himalayan trek", excerpt: "What to actually carry for a beginner-friendly winter trek like Kedarkantha." },
  { slug: "char-dham-yatra-for-seniors", title: "Planning a Char Dham Yatra for senior citizens", excerpt: "Pony, palki and pacing — what to plan for when parents or grandparents are travelling." },
  { slug: "understanding-tcs-international-travel", title: "Understanding TCS on international tour packages", excerpt: "What the 2% TCS line on your invoice means, and how to adjust it against your income tax." },
];

export default function BlogPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Blog</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-xl border border-border bg-surface p-4 hover:border-accent">
            <p className="font-semibold">{p.title}</p>
            <p className="mt-1 text-sm text-foreground-muted">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

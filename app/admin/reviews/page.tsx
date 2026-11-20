import { prisma } from "@/lib/db/client";
import ReviewModerationRow from "@/app/components/admin/ReviewModerationRow";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ include: { tour: true }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Review moderation</h1>
      <div className="mt-4 space-y-2">
        {reviews.map((r) => (
          <ReviewModerationRow key={r.id} review={{ id: r.id, name: r.name, text: r.text, tourTitle: r.tour.title, isSampleData: r.isSampleData, rating: r.rating }} />
        ))}
      </div>
    </div>
  );
}

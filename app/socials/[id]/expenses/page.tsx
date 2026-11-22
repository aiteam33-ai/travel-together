import { redirect } from "next/navigation";

// Expenses now lives merged into the Plan & Expenses page (see
// app/socials/[id]/plan/page.tsx) — this route stays only so old links and
// bookmarks still land somewhere useful instead of 404ing.
export default async function GroupExpensesRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/socials/${id}/plan#settle-up`);
}

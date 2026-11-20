import { redirect } from "next/navigation";

export default async function GroupIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/socials/${id}/overview`);
}

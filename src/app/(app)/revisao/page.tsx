import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SRSSession } from "@/components/srs/SRSSession";

export default async function RevisaoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const items = await prisma.sRSItem.findMany({
    where: { userId: session.user.id, dueDate: { lte: new Date() } },
    orderBy: { dueDate: "asc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SRSSession initialItems={items.map((i) => ({ id: i.itemId, type: i.itemType }))} />
    </div>
  );
}

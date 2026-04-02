import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModuleById } from "@/data/curriculum";
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mod = getModuleById(params.moduleId);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const modProgress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId: params.moduleId } },
  });
  if (!modProgress || modProgress.status === "locked") {
    return NextResponse.json({ error: "Module not unlocked" }, { status: 403 });
  }

  const questions = shuffle(mod.examQuestions).slice(0, 15);
  return NextResponse.json({ questions, passThreshold: mod.passThreshold, moduleTitle: mod.title });
}

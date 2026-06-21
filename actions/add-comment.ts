"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addComment(shortId: string, formData: FormData) {
  const text = formData.get("comment") as string;

  if (!text || text.trim().length === 0) return;

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const loggedInUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!loggedInUser) throw new Error("User not found");

  await prisma.comment.create({
    data: {
      text: text.trim(),
      shortId,
      userId: loggedInUser.id,
    },
  });

  revalidatePath("/");
}
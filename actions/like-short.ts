"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleLike(shortId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (!dbUser) {
      return { error: "User not found" };
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_shortId: {
          userId: dbUser.id,
          shortId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_shortId: {
            userId: dbUser.id,
            shortId,
          },
        },
      });

      revalidatePath("/");
      return { liked: false };
    }

    await prisma.like.create({
      data: {
        userId: dbUser.id,
        shortId,
      },
    });

    revalidatePath("/");
    return { liked: true };
  } catch (error) {
    console.error("Like error:", error);
    return { error: "Failed to toggle like" };
  }
}
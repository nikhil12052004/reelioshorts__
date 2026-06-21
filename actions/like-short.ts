"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleLike(shortId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const loggedInUser = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!loggedInUser) {
    throw new Error("User not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_shortId: {
        userId: loggedInUser.id,
        shortId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    await prisma.like.create({
      data: {
        userId: loggedInUser.id,
        shortId,
      },
    });
  }

  revalidatePath("/");
}
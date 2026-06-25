"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function uploadShort(data: {
  title: string;
  description: string;
  videoUrl: string;
}) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized. Please sign in." };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) {
      return { error: "User not found in database." };
    }

    // ✅ Sirf database mein save karo
    const short = await prisma.short.create({
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        userId: dbUser.id,
      },
    });

    revalidatePath("/");
    return { success: true, short };

  } catch (error) {
    console.error("Database error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to save video.",
    };
  }
}
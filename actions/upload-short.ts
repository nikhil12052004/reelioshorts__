"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function uploadShort(data: {
  title: string;
  description: string;
  videoUrl: string;
}) {
  try {
    const user = await currentUser();

    if (!user) return { error: "Unauthorized. Please sign in." };
    if (!data.title?.trim()) return { error: "Title is required." };
    if (!data.videoUrl?.trim()) return { error: "Video URL is required." };

    const videoUrl = data.videoUrl.trim();

    if (!videoUrl.startsWith("https://res.cloudinary.com/")) {
      return { error: "Invalid Cloudinary video URL." };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser) return { error: "User not found in database." };

    const short = await prisma.short.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || "",
        videoUrl,
        userId: dbUser.id,
      },
    });

    revalidatePath("/");
    return { success: true, short };
  } catch {
    return { error: "Failed to save video." };
  }
}
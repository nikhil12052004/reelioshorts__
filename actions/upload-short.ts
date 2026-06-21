"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export type UploadShortState = {
  errors: {
    title?: string[];
    description?: string[];
    video?: string[];
    formError?: string[];
  };
  success?: boolean;
};

const uploadShortSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  video: z.string().min(1, "Video is required"),
});

export async function uploadShortAction(
  prevState: UploadShortState,
  formData: FormData
): Promise<UploadShortState> {
  const { userId } = await auth();

  if (!userId) {
    return { errors: { formError: ["You must be logged in"] } };
  }

  const result = uploadShortSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    video: formData.get("video"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const loggedInUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!loggedInUser) {
    return { errors: { formError: ["User not found in database"] } };
  }

  await prisma.short.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      videoUrl: result.data.video,
      userId: loggedInUser.id,
    },
  });

  redirect("/");
}
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import ShortCard from "@/components/shorts/short-cart";
import { EmptyState } from "@/components/ui/empty-state";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const loggedInUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!loggedInUser) {
    await prisma.user.create({
      data: {
        name: user.fullName || "Anonymous",
        email: user.emailAddresses[0].emailAddress,
        clerkUserId: user.id,
      },
    });
  }

  const shorts = await prisma.short.findMany({
    include: {
      user: {
        select: {
          id: true,  // ✅ YEH ADD KARO - ID MISSING THI
          name: true,
          email: true,
        },
      },
      likes: true,
      comments: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Show empty state if no videos
  if (shorts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-auto snap-y snap-mandatory">
      <div className="flex flex-col items-center">
        {shorts.map((short) => (
          <div
            key={short.id}
            className="snap-start flex justify-center items-center min-h-[calc(100vh-80px)]"
          >
            <ShortCard short={short} />
          </div>
        ))}
      </div>
    </div>
  );
}
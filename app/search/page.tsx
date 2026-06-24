import { prisma } from "@/lib/prisma";
import ShortCard from "@/components/shorts/short-cart";
import { Search, Film } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q || "";

  const results = await prisma.short.findMany({
    where: {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      user: {
        select: {
          id: true,
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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">
          Results for "{query}"
        </h1>
        <span className="text-sm text-muted-foreground">
          ({results.length} videos)
        </span>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
          <Film className="h-16 w-16 mb-4 opacity-30" />
          <h2 className="text-xl font-semibold">No videos found</h2>
          <p className="text-sm">Try searching with a different title</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((short) => (
            <div key={short.id} className="aspect-[9/16]">
              <ShortCard short={short} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
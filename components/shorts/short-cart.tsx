"use client";

import { useRef, useState } from "react";
import { Prisma } from "@prisma/client";
import { Card, CardFooter } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Play, Pause } from "lucide-react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/like-short";
import { MessageCircle } from "lucide-react";
import { addComment } from "@/actions/add-comment";


type ShortCardProps = {
  short: Prisma.ShortGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
      };
    };
    likes: true;
    comments: true,
  };
}>;
};

export default function ShortCard({ short }: ShortCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Card className="relative h-[640px] w-[360px] overflow-hidden rounded-xl border-0 p-0 shadow-lg">
      {/* Video */}
      <video
        ref={videoRef}
        src={short.videoUrl}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full object-cover z-0"
      />

      {/* Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute inset-0 z-20 flex items-center justify-center text-white"
      >
        {isPlaying ? (
          <Pause className="h-14 w-14 opacity-70" />
        ) : (
          <Play className="h-14 w-14 opacity-70" />
        )}
      </button>

      {/* Footer */}
<CardFooter className="absolute bottom-6 left-0 z-30 w-full bg-transparent border-none text-white">
  <div>
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src="" alt="channel owner photo" />
        <AvatarFallback>
          {short.user.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <h3 className="font-semibold">{short.title}</h3>
        <span className="text-sm text-white/80">
          {short.user.name}
        </span>
      </div>
    </div>

    <p className="mt-2 text-sm text-white/90">
      {short.description}
    </p>
  </div>
</CardFooter>

{/* Like Button */}
<form
  action={() => toggleLike(short.id)}
  className="absolute right-4 bottom-28 z-30"
>
  <button
    type="submit"
    className="flex flex-col items-center text-white"
  >
    <Heart className="h-8 w-8" />
    <span className="text-sm">{short.likes.length}</span>
  </button>
</form>

{/* Comment Count */}
<div className="absolute right-4 bottom-12 z-30 flex flex-col items-center text-white">
  <MessageCircle className="h-8 w-8" />
  <span className="text-sm">{short.comments.length}</span>
</div>

{/* Comment Form */}
<form
  action={(formData) => addComment(short.id, formData)}
  className="absolute bottom-1 left-3 right-16 z-40 flex gap-2"
>
  <input
    name="comment"
    placeholder="Add comment..."
    className="flex-1 rounded-md bg-black/50 px-2 py-1 text-sm text-white outline-none"
  />
  <button
    type="submit"
    className="rounded-md bg-white/20 px-3 py-1 text-sm text-white"
  >
    Post
  </button>
</form>
    </Card>
  );
}
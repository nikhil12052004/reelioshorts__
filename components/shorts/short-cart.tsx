"use client";

import { useRef, useState, useTransition } from "react";
import { Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  X,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toggleLike } from "@/actions/like-short";
import { addComment } from "@/actions/add-comment";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

type ShortCardProps = {
  short: Prisma.ShortGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          email: true;
        };
      };
      likes: true;
      comments: {
        include: {
          user: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>;
};

function cleanCloudinaryUrl(url: string) {
  return url.replace("/upload/f_mp4,vc_h264,q_auto/", "/upload/");
}

export default function ShortCard({ short }: ShortCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = cleanCloudinaryUrl(short.videoUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [localLikes, setLocalLikes] = useState(short.likes.length);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const handleLike = async () => {
    if (!user || isLikeProcessing) return;

    setIsLikeProcessing(true);

    const oldLiked = hasLiked;
    const oldLikes = localLikes;

    setHasLiked(!oldLiked);
    setLocalLikes(oldLiked ? Math.max(0, oldLikes - 1) : oldLikes + 1);

    try {
      const result = await toggleLike(short.id);
      if (result?.error) throw new Error(result.error);
    } catch {
      setHasLiked(oldLiked);
      setLocalLikes(oldLikes);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setVideoFailed(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleAddComment = async (formData: FormData) => {
    const comment = formData.get("comment")?.toString();
    if (!comment?.trim()) return;

    startTransition(async () => {
      await addComment(short.id, formData);
      setCommentText("");
      router.refresh();
    });
  };

  return (
    <Card className="relative h-[640px] w-[360px] overflow-hidden rounded-xl border-0 bg-black p-0 shadow-2xl">
      <div className="absolute inset-0 h-full w-full bg-black">
        {!videoFailed ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration || 0);
              setVideoLoaded(true);
            }}
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => {
              setVideoFailed(true);
              setVideoLoaded(true);
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
              }
            }}
            className="block h-full w-full bg-black object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/70">
            Video could not load. Please re-upload this video.
          </div>
        )}
      </div>

      {!videoLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[50%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {duration > 0 && (
        <div className="absolute right-3 top-3 z-30 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
          {Math.floor(duration)}s
        </div>
      )}

      <button
        type="button"
        onClick={togglePlay}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-white"
      >
        <div
          className={`rounded-full bg-black/40 p-4 transition-all duration-300 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        >
          {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="ml-1 h-10 w-10" />}
        </div>
      </button>

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-12 top-3 z-40 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      <div className="absolute bottom-0 left-0 right-0 z-40 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-14 left-3 right-20 z-30">
        <div className="mb-1 flex items-center gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white/20">
            <AvatarImage src="" alt="channel owner" />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs text-white">
              {short.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-sm font-semibold text-white">
              {short.title}
            </h3>
            <span className="truncate text-xs text-white/70">
              {short.user.name}
            </span>
          </div>
        </div>

        {short.description && (
          <p className="ml-10 mt-1 line-clamp-2 text-sm text-white/80">
            {short.description}
          </p>
        )}
      </div>

      <div className="absolute bottom-14 right-3 z-40 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLikeProcessing || !user}
          className="group flex flex-col items-center text-white"
        >
          <Heart
            className={`h-7 w-7 transition-all duration-200 ${
              hasLiked
                ? "scale-110 fill-red-500 text-red-500"
                : "text-white group-hover:scale-110"
            } ${isLikeProcessing ? "opacity-70" : ""}`}
          />
          <span className="text-xs text-white/80">{localLikes}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="group flex flex-col items-center text-white"
        >
          <MessageCircle className="h-7 w-7 group-hover:scale-110" />
          <span className="text-xs text-white/80">{short.comments.length}</span>
        </button>
      </div>

      <form
        action={handleAddComment}
        className="absolute bottom-2 left-3 right-12 z-40 flex gap-2"
      >
        <Input
          name="comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="h-8 flex-1 rounded-full border-white/10 bg-black/60 text-sm text-white placeholder:text-white/40"
          disabled={isPending}
        />

        <button
          type="submit"
          className="h-8 rounded-full bg-white/20 px-3 text-sm text-white hover:bg-white/30 disabled:opacity-50"
          disabled={!commentText.trim() || isPending}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {showComments && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white">Comments</h3>

            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="text-white/70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {short.comments.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-white/60">
                <MessageCircle className="mb-2 h-12 w-12 opacity-30" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              short.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-white/5 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs text-white">
                        {comment.user?.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>

                    <p className="truncate text-sm font-semibold text-white">
                      {comment.user?.name || "Anonymous"}
                    </p>
                  </div>

                  <p className="ml-8 break-words text-sm text-white/90">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 bg-black/50 p-4">
            <form action={handleAddComment} className="flex gap-2">
              <Input
                name="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border-0 bg-white/10 text-white placeholder:text-white/50"
                disabled={isPending}
                autoFocus
              />

              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-white/20 hover:bg-white/30"
                disabled={!commentText.trim() || isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
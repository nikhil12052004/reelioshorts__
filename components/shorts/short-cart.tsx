"use client";

import { useRef, useState, useTransition } from "react";
import { Prisma } from "@prisma/client";
import { Card, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, Heart, MessageCircle, X, Send, Volume2, VolumeX } from "lucide-react";
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

export default function ShortCard({ short }: ShortCardProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  // ✅ Direct compute - No useEffect needed (ESLint fix)
  const [localLikes, setLocalLikes] = useState(short.likes.length);
  const hasLiked = isLoaded && user 
    ? short.likes.some(like => like.userId === user.id) 
    : false;

  // ✅ FAST LIKE HANDLER - Instant update
  const handleLike = async () => {
    if (!user) return;

    // Instant UI update
    if (hasLiked) {
      setLocalLikes(prev => prev - 1);
    } else {
      setLocalLikes(prev => prev + 1);
    }

    // Background API call
    try {
      await toggleLike(short.id);
    } catch (error) {
      console.error("Like failed:", error);
      // Revert on error
      setLocalLikes(prev => hasLiked ? prev + 1 : prev - 1);
    }
  };

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
    <Card className="relative h-[640px] w-[360px] overflow-hidden rounded-xl border-0 p-0 shadow-2xl bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={short.videoUrl}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          setProgress((video.currentTime / video.duration) * 100);
        }}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          setDuration(video.duration);
          setVideoLoaded(true);
        }}
        onCanPlay={() => setVideoLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover z-0"
        muted={isMuted}
      />

      {/* Loading Spinner */}
      {!videoLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white" />
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* Duration Badge */}
      {duration > 0 && (
        <div className="absolute bottom-20 right-3 z-20 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
          {Math.floor(duration)}s
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute inset-0 z-20 flex items-center justify-center text-white transition-all duration-300 group"
      >
        <div className={`
          bg-black/40 backdrop-blur-sm rounded-full p-4 
          transition-all duration-300
          ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          hover:bg-black/60 hover:scale-110
        `}>
          {isPlaying ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10 ml-1" />
          )}
        </div>
      </button>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 z-30 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* User Info */}
      <div className="absolute bottom-6 left-3 right-20 z-30">
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-8 w-8 border-2 border-white/20 flex-shrink-0">
            <AvatarImage src="" alt="channel owner" />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
              {short.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <h3 className="text-white font-semibold text-sm truncate drop-shadow-lg">
              {short.title}
            </h3>
            <span className="text-xs text-white/70 truncate drop-shadow-lg">
              {short.user.name}
            </span>
          </div>
        </div>

        {short.description && (
          <p className="text-sm text-white/80 line-clamp-2 drop-shadow-lg mt-1 ml-10">
            {short.description}
          </p>
        )}
      </div>

      {/* Like & Comment Buttons */}
      <div className="absolute bottom-16 right-3 z-30 flex flex-col items-center gap-4">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center text-white group relative"
        >
          <div className="relative">
            <Heart 
              className={`
                h-7 w-7 transition-all duration-150 ease-out
                ${hasLiked 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-white group-hover:scale-110'
                }
              `}
            />
            
            {hasLiked && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ripple-ring" />
              </div>
            )}
          </div>
          
          <span className="text-xs text-white/80 transition-all duration-150">
            {localLikes}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-col items-center text-white group"
        >
          <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-white/80">{short.comments.length}</span>
        </button>
      </div>

      {/* Comment Input */}
      <form
        action={handleAddComment}
        className="absolute bottom-2 left-3 right-12 z-30 flex gap-2"
      >
        <Input
          name="comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-full bg-black/60 border-white/10 text-white placeholder:text-white/40 text-sm h-8 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-purple-500"
          disabled={isPending}
        />
        <button
          type="submit"
          className="rounded-full bg-white/20 px-3 text-white hover:bg-white/30 transition-colors disabled:opacity-50 text-sm h-8"
          disabled={!commentText.trim() || isPending}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Comments Popup */}
      {showComments && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-white font-semibold text-lg">Comments</h3>
            <button
              onClick={() => setShowComments(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {short.comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <MessageCircle className="h-12 w-12 mb-2 opacity-30" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              short.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        {comment.user?.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white font-semibold text-sm truncate">
                      {comment.user?.name || "Anonymous"}
                    </p>
                  </div>
                  <p className="text-white/90 text-sm ml-8 break-words">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/50 flex-shrink-0">
            <form action={handleAddComment} className="flex gap-2">
              <Input
                name="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-white/10 border-0 text-white placeholder:text-white/50"
                disabled={isPending}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-white/20 hover:bg-white/30 flex-shrink-0"
                disabled={!commentText.trim() || isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes ripple-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ripple-ring {
          animation: ripple-ring 0.5s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
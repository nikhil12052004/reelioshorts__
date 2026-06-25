"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Film, AlertCircle } from "lucide-react";
import { uploadShort } from "@/actions/upload-short";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("❌ Please select a video file");
      return;
    }

    if (!title.trim()) {
      setError("❌ Please enter a title");
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      // ✅ Step 1: Cloudinary pe direct upload (client-side)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "reelioshorts"); // Cloudinary upload preset

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      setProgress(70);

      if (!cloudinaryData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      // ✅ Step 2: Database mein save karo
      const result = await uploadShort({
        title: title.trim(),
        description: description?.trim() || "",
        videoUrl: cloudinaryData.secure_url,
      });

      setProgress(100);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("❌ Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-6 w-6" />
            Upload Your Short
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="video-upload">Video File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*,.mp4,.webm,.ogg,.mov,.avi,.mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      setError(null);
                    }
                  }}
                  className="block w-full cursor-pointer"
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  MP4, WebM, OGG, MOV, AVI, MPEG (Max 100MB)
                </p>
                {file && (
                  <p className="text-sm text-primary mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title..."
                disabled={uploading}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your video about?"
                disabled={uploading}
                maxLength={500}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to Cloudinary...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!file || !title.trim() || uploading}
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
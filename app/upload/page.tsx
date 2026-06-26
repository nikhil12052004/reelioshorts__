"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadShort } from "@/actions/upload-short";
import { Film, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
];

function validateVideoFile(file: File) {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return "❌ Only video files are allowed. Use MP4, WebM, OGG, MOV, AVI, or MPEG.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "❌ Video must be under 100MB.";
  }

  return null;
}

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateVideoFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("❌ Please select a video file.");
      return;
    }

    const validationError = validateVideoFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!title.trim()) {
      setError("❌ Please enter a title.");
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", "reelioshorts");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!cloudName) {
        throw new Error("Cloudinary cloud name is missing.");
      }

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      setProgress(70);

      if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
        throw new Error(
          cloudinaryData?.error?.message || "Cloudinary upload failed."
        );
      }

      const secureUrl = cloudinaryData.secure_url as string;

      if (!secureUrl.startsWith("https://res.cloudinary.com/")) {
        throw new Error("Invalid Cloudinary video URL.");
      }

      const result = await uploadShort({
        title: title.trim(),
        description: description.trim(),
        videoUrl: secureUrl,
      });

      setProgress(100);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Upload failed. Please try again."
      );
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
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-red-500">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="video-upload">Video File *</Label>

              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-primary/50">
                <input
                  id="video-upload"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/mpeg"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer"
                  disabled={uploading}
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  MP4, WebM, OGG, MOV, AVI, MPEG only. Max 100MB.
                </p>

                {file && (
                  <p className="mt-2 text-sm text-primary">
                    Selected: {file.name}{" "}
                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
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
              <Label htmlFor="description">Description Optional</Label>
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
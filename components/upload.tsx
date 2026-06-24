"use client";

import React, { useState } from "react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Progress } from "./ui/progress";
import { AlertCircle, Film, X } from "lucide-react";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

// ✅ Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
  "video/mp2t", // TS
  "video/3gpp", // 3GP
  "video/x-matroska", // MKV
];

// ✅ Allowed video extensions
const ALLOWED_VIDEO_EXTENSIONS = [
  ".mp4", ".webm", ".ogg", ".mov", ".avi", 
  ".mpeg", ".mpg", ".ts", ".3gp", ".mkv"
];

const authenticator = async () => {
  try {
    const response = await fetch("/api/auth");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }

    throw new Error("Authentication request failed");
  }
};

type UploadProps = {
  setVideoUrl: (url: string) => void;
};

export default function Upload({ setVideoUrl }: UploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Custom file validation
  const validateFile = (file: File): boolean => {
    // 1. Check if it's a video
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError(
        `❌ "${file.name}" is not a valid video file. Supported formats: MP4, WebM, OGG, MOV, AVI, MPEG, MKV, 3GP`
      );
      return false;
    }

    // 2. Check file extension
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(fileExtension)) {
      setError(
        `❌ Invalid file format. Please upload a video file (MP4, WebM, OGG, MOV, AVI, MPEG, MKV, 3GP)`
      );
      return false;
    }

    // 3. Check file size (50MB max for ImageKit free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError(
        `❌ File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB`
      );
      return false;
    }

    // 4. Check minimum file size (prevent empty files)
    if (file.size < 1024) {
      setError("❌ File is too small. Please upload a valid video.");
      return false;
    }

    setError(null);
    return true;
  };

  // ✅ Custom onError handler with better messages
  const onError = (err: unknown) => {
    console.log("Upload Error:", err);
    
    let errorMessage = "Upload failed. Please try again.";
    
    if (typeof err === "object" && err !== null && "message" in err) {
      const msg = err.message;
      
      // Check for specific ImageKit errors
      if (typeof msg === "string") {
        if (msg.includes("size")) {
          errorMessage = "❌ Video is too large. Maximum size is 50MB.";
        } else if (msg.includes("type") || msg.includes("format")) {
          errorMessage = "❌ Invalid video format. Please upload a supported video file.";
        } else {
          errorMessage = `❌ ${msg}`;
        }
      }
    }
    
    setError(errorMessage);
    setUploadProgress(null);
    setIsUploading(false);
  };

  // ✅ onSuccess handler
  const onSuccess = (res: IKUploadResponse) => {
    console.log("Upload Success:", res);
    setVideoUrl(res.url);
    setUploadProgress(100);
    setError(null);
    setIsUploading(false);
    
    // Show success message
    console.log("✅ Video uploaded successfully!");
  };

  // ✅ Upload progress handler
  const onUploadProgress = (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
    if (evt.lengthComputable) {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setUploadProgress(progress);
    }
  };

  // ✅ Upload start handler
  const onUploadStart = (evt?: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt?.target?.files?.[0];
    
    if (file) {
      // Validate file before upload starts
      if (!validateFile(file)) {
        evt.target.value = ""; // Reset input
        return;
      }
      
      setFileName(file.name);
      setUploadProgress(0);
      setError(null);
      setIsUploading(true);
    }
  };

  // ✅ Handle file selection before upload
  const handleFileChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    
    if (!file) {
      setFileName(null);
      return;
    }

    // Validate on selection
    if (!validateFile(file)) {
      evt.target.value = ""; // Reset input
      setFileName(null);
      return;
    }

    setFileName(file.name);
    setError(null);
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Upload Video</p>
        </div>

        {/* File Input with Accept Attribute */}
        <div className="relative">
          <IKUpload
            useUniqueFileName={true}
            folder="/reelioshorts"
            accept="video/*,.mp4,.webm,.ogg,.mov,.avi,.mpeg,.mpg,.ts,.3gp,.mkv"
            validateFile={(file) => {
              // Additional validation through ImageKit's built-in validation
              return file.size < 50 * 1024 * 1024;
            }}
            onError={onError}
            onSuccess={onSuccess}
            onUploadProgress={onUploadProgress}
            onUploadStart={onUploadStart}
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 
              file:mr-4 file:px-4 file:py-2 file:rounded-md 
              file:border-0 file:text-sm file:font-semibold 
              file:bg-primary/10 file:text-primary 
              hover:file:bg-primary/20 transition-colors
              file:cursor-pointer cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          />
        </div>

        {/* File Info (shows when file is selected) */}
        {fileName && !error && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md border border-primary/10">
            <Film className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground truncate flex-1">
              {fileName}
            </span>
            <button
              type="button"
              onClick={() => {
                setFileName(null);
                setError(null);
                setUploadProgress(null);
                // Reset file input
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (input) input.value = "";
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Supported Formats Hint */}
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Supported formats:</span> MP4, WebM, OGG, MOV, AVI, MPEG, MKV, 3GP 
          <span className="ml-2">•</span>
          <span className="ml-2">Max size: 50MB</span>
        </p>

        {/* Upload Progress */}
        {uploadProgress !== null && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Success Message */}
        {uploadProgress === 100 && !error && fileName && (
          <div className="flex items-center gap-2 p-2 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
            <span className="text-sm">✅ Video uploaded successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-medium">Upload Failed</span>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}
      </div>
    </ImageKitProvider>
  );
}
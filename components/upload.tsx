"use client";

import React, { useState } from "react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Progress } from "./ui/progress";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

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

  const onError = (err: unknown) => {
    console.log("Error", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof err.message === "string"
    ) {
      setError(err.message);
    } else {
      setError("Upload failed");
    }

    setUploadProgress(null);
  };

  const onSuccess = (res: IKUploadResponse) => {
    console.log("Success", res);
    setVideoUrl(res.url);
    setUploadProgress(100);
    setError(null);
  };

  const onUploadProgress = (
    evt: ProgressEvent<XMLHttpRequestEventTarget>
  ) => {
    if (evt.lengthComputable) {
      const progress = Math.round((evt.loaded / evt.total) * 100);
      setUploadProgress(progress);
    }
  };

  const onUploadStart = () => {
    setUploadProgress(0);
    setError(null);
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <p>Upload File</p>

      <IKUpload
        useUniqueFileName={true}
        validateFile={(file) => file.size < 20 * 1024 * 1024}
        folder="/sample-folder"
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onUploadProgress}
        onUploadStart={onUploadStart}
        className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:px-4 file:py-2 file:rounded-md"
      />

      {uploadProgress !== null && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </ImageKitProvider>
  );
}
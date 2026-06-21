"use client";
<<<<<<< HEAD

import React, { useState } from "react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
=======
import React, { useRef, useState } from "react";
import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Progress } from "./ui/progress";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

const authenticator = async () => {
  try {
<<<<<<< HEAD
    const response = await fetch("/api/auth");
=======
    const response = await fetch("http://localhost:3000/api/auth");
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
<<<<<<< HEAD

=======
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
    return { signature, expire, token };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
<<<<<<< HEAD

    throw new Error("Authentication request failed");
=======
    throw error;
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
  }
};

type UploadProps = {
  setVideoUrl: (url: string) => void;
};

export default function Upload({ setVideoUrl }: UploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
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
=======
  const onError = (err: any) => {
    console.log("Error", err);
    setError(err.message);
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7

    setUploadProgress(null);
  };

  const onSuccess = (res: IKUploadResponse) => {
    console.log("Success", res);
    setVideoUrl(res.url);
    setUploadProgress(100);
    setError(null);
  };

<<<<<<< HEAD
  const onUploadProgress = (
    evt: ProgressEvent<XMLHttpRequestEventTarget>
  ) => {
    if (evt.lengthComputable) {
      const progress = Math.round((evt.loaded / evt.total) * 100);
=======
  const onUploadProgress = (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
    if (evt.lengthComputable) {
      const progress = Math.round(evt.loaded / evt.total * 100);
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
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
<<<<<<< HEAD

      <IKUpload
        useUniqueFileName={true}
        validateFile={(file) => file.size < 20 * 1024 * 1024}
        folder="/sample-folder"
=======
      <IKUpload
        useUniqueFileName={true}
        validateFile={(file) => file.size < 20 * 1024 * 1024}
        folder={"/sample-folder"}
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onUploadProgress}
        onUploadStart={onUploadStart}
<<<<<<< HEAD
        className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:px-4 file:py-2 file:rounded-md"
      />

=======
        className="mt-1 block w-full text-sm tex-gray-900 file:mr-4 file:px-4 file:py-2 file:rounded-md"
      />

      {/* Show progress bar only when upload is in progress  */}
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
      {uploadProgress !== null && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

<<<<<<< HEAD
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
=======
      {/* Show error message if upload fails  */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
>>>>>>> cfd576d7094fd6a8a0b9f8b97f3505bd24afbed7
    </ImageKitProvider>
  );
}
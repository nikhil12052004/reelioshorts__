"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadShortAction, type UploadShortState } from "@/actions/upload-short";
import Upload from "@/components/upload";
import { Loader2 } from "lucide-react";

const initialState: UploadShortState = {
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Uploading...
        </>
      ) : (
        "Upload"
      )}
    </Button>
  );
}

export default function Page() {
  const [formState, action] = useActionState(uploadShortAction, initialState);
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = (formData: FormData) => {
    formData.append("video", videoUrl);
    action(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold text-center">Upload Video</h1>

      <form action={handleSubmit}>
        <div className="mb-4">
          <Label>Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            className="mt-1"
          />
          {formState.errors.title && (
            <span className="text-red-500 text-sm">
              {formState.errors.title[0]}
            </span>
          )}
        </div>

        <div className="mb-4">
          <Label>Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            placeholder="Description"
            className="mt-1"
          />
          {formState.errors.description && (
            <span className="text-red-500 text-sm">
              {formState.errors.description[0]}
            </span>
          )}
        </div>

        <div className="mb-4">
          <Upload setVideoUrl={setVideoUrl} />
        </div>

        {formState.errors.video && (
          <p className="text-red-500 text-sm mb-4">
            {formState.errors.video[0]}
          </p>
        )}

        {formState.errors.formError && (
          <div className="border border-red-500 bg-red-100 p-2 mb-4 rounded">
            <p className="text-red-600">{formState.errors.formError[0]}</p>
          </div>
        )}

        {formState.success && (
          <p className="text-green-600 text-sm mb-4">
            Video uploaded successfully!
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
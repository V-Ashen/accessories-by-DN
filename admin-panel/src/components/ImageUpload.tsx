"use client";

import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset="accessories_preset" // Matches the preset you just created!
      onSuccess={(result: any) => {
        // When upload finishes, pass the secure Cloudinary URL back to our form
        onUpload(result.info.secure_url);
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Product Image
        </button>
      )}
    </CldUploadWidget>
  );
}
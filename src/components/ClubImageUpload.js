"use client";

import { useDropzone } from "react-dropzone";
import { useState } from "react";

const ClubImageUpload = ({ setFieldValue }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFieldValue("clubImage", file); // Set the file in Formik
    setPreview(URL.createObjectURL(file)); // Create a preview of the image
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/gif, image/webp",
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5MB limit
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop an image, or click to select one</p>
      </div>
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ClubImageUpload;

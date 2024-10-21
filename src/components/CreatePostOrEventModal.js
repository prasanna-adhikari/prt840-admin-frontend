import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import { FiUpload, FiPlus } from "react-icons/fi";

const CreatePostOrEventModal = ({
  isVisible,
  onClose,
  clubId,
  type,
  onSuccess,
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  // Validation schema for both posts and events
  const validationSchema = Yup.object().shape({
    content: Yup.string()
      .required("Content is required")
      .min(5, "Content must be at least 5 characters long"),
    ...(type === "event" && {
      eventName: Yup.string().required("Event name is required"),
      eventDate: Yup.date().required("Event date is required"),
      location: Yup.string().required("Location is required"),
    }),
  });

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", values.content);

      if (values.media) {
        formData.append("media", values.media);
      }

      if (type === "event") {
        formData.append("eventName", values.eventName);
        formData.append("eventDate", values.eventDate);
        formData.append("location", values.location);
      }

      const url =
        type === "event"
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs/${clubId}/event`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs/${clubId}/posts`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create the post/event");
      }

      await response.json();
      resetForm();
      setStatus({ success: true });
      onClose();
      setPreviewImage(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setStatus({ success: false, errorMessage: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const onDrop = (acceptedFiles, setFieldValue) => {
    const file = acceptedFiles[0];
    if (file) {
      setFieldValue("media", file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title={`Create a New ${type === "event" ? "Event" : "Post"}`}
    >
      <Formik
        initialValues={{
          content: "",
          ...(type === "event" && {
            eventName: "",
            eventDate: "",
            location: "",
          }),
          media: null,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, status }) => {
          const { getRootProps, getInputProps } = useDropzone({
            onDrop: (acceptedFiles) => onDrop(acceptedFiles, setFieldValue),
            accept: "image/jpeg, image/png, image/gif, image/webp",
            maxFiles: 1,
            maxSize: 1024 * 1024 * 5,
          });

          return (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <Field
                  as="textarea"
                  name="content"
                  id="content"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                  aria-required="true"
                />
                <ErrorMessage
                  name="content"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {type === "event" && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="eventName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Event Name
                    </label>
                    <Field
                      type="text"
                      name="eventName"
                      id="eventName"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                      aria-required="true"
                    />
                    <ErrorMessage
                      name="eventName"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="eventDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Event Date
                    </label>
                    <Field
                      type="datetime-local"
                      name="eventDate"
                      id="eventDate"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                      aria-required="true"
                    />
                    <ErrorMessage
                      name="eventDate"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <Field
                      type="text"
                      name="location"
                      id="location"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                      aria-required="true"
                    />
                    <ErrorMessage
                      name="location"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label
                  htmlFor="media"
                  className="block text-sm font-medium text-gray-700"
                >
                  Media (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:bg-gray-50 transition duration-300"
                >
                  <input {...getInputProps()} />
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Drag 'n' drop an image, or click to select one
                  </p>
                  <p className="text-xs text-gray-500">
                    (JPEG, PNG, GIF, WEBP - max 5MB)
                  </p>
                </div>
                {previewImage && (
                  <div className="mt-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md shadow-md"
                    />
                  </div>
                )}
              </div>

              {status && status.errorMessage && (
                <div className="text-red-500 text-sm mb-4">
                  {status.errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 shadow-md flex items-center"
              >
                <FiPlus className="mr-2" />
                {isSubmitting
                  ? "Creating..."
                  : `Create ${type === "event" ? "Event" : "Post"}`}
              </button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default CreatePostOrEventModal;

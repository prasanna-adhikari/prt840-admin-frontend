"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Modal from "../../../components/Modal";
import Loading from "../../../components/Loading"; // Add loading spinner
import Sidenav from "../../../components/Sidenav"; // Add sidenav
import CreatePostOrEventModal from "../../../components/CreatePostOrEventModal"; // Import the new component
import PostCard from "@/components/PostCard";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ClubImageUpload from "../../../components/ClubImageUpload";
import { FiPlus } from "react-icons/fi";

const ClubDetail = () => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false); // Loading state for updating club
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility for update
  const [showAllFollowers, setShowAllFollowers] = useState(false); // Control visibility of followers
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] =
    useState(false); // Control modal visibility for creating posts
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] =
    useState(false); // Control modal visibility for creating events
  const { id: clubId } = useParams(); // Destructure 'id' from useParams()
  const [token, setToken] = useState(null); // State to hold the token

  // Fetch the token from localStorage after the component has mounted
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we are in the browser environment
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Reusable function to fetch club details
  const fetchClub = async () => {
    if (!token) return;

    setLoading(true); // Set loading state when fetching club
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs/${clubId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch club details");
      }

      const data = await response.json();
      setClub(data.result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId && token) {
      fetchClub();
    }
  }, [clubId, token]);

  // Callback function to refresh club data after a new post or event is created
  const refreshClubData = () => {
    fetchClub();
  };

  if (loading) {
    return <Loading />; // Use the Loading component when fetching data
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const followersToShow = showAllFollowers
    ? club?.followers
    : club?.followers?.slice(0, 3);

  return (
    <div className="flex">
      <Sidenav /> {/* Include Sidenav */}
      <div className="flex-1 p-8 bg-gray-100 min-h-screen ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Club Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800">{club.name}</h1>
            <button
              onClick={() => setIsModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-md transition duration-300"
            >
              Update Club
            </button>
          </div>
          <p className="text-lg mt-4 text-gray-700">{club.description}</p>
          {club.clubImage && (
            <div className="mt-6">
              <img
                src={`http://localhost:7000/${club.clubImage
                  .replace("src\\", "")
                  .replace(/\\/g, "/")}`}
                alt={club.name}
                className="w-full h-[35rem] object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Followers Section */}
          <div className="mt-8 mb-2">
            <h2 className="text-3xl font-semibold text-gray-800">Followers</h2>
            <div
              className={`flex flex-wrap gap-4 mt-4 transition-all duration-500 ${
                showAllFollowers ? "max-h-full" : "max-h-[200px]"
              } overflow-hidden`}
            >
              {followersToShow?.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center space-x-4 bg-white p-4 rounded-lg "
                  style={{ minWidth: "180px" }}
                >
                  <div className="w-12 h-12">
                    {follower.profileImage ? (
                      <img
                        src={`http://localhost:7000/${follower.profileImage
                          .replace("src\\", "")
                          .replace(/\\/g, "/")}`}
                        alt={follower.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-full text-white text-lg font-semibold">
                        {follower.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {follower.name}
                    </p>
                    <p className="text-gray-600 text-sm">{follower.email}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Show more or less followers button */}
            {club?.followers?.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllFollowers(!showAllFollowers)}
                  className="bg-blue-300 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition duration-300"
                >
                  {showAllFollowers ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mt-10">
            Posts & Events
          </h2>
          <div className="flex space-x-4 mt-5">
            <button
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition duration-300"
              onClick={() => setIsCreatePostModalVisible(true)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <FiPlus className="w-8 h-8" />
                </div>
                <p className="text-xl text-gray-800 font-semibold">
                  Create a New Post
                </p>
              </div>
            </button>
            <button
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition duration-300"
              onClick={() => setIsCreateEventModalVisible(true)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                  <FiPlus className="w-8 h-8" />
                </div>
                <p className="text-xl text-gray-800 font-semibold">
                  Create a New Event
                </p>
              </div>
            </button>
          </div>

          {/* Posts Section */}
          <PostCard clubId={club._id} token={token} />

          {/* Modal for Creating Post */}
          <CreatePostOrEventModal
            isVisible={isCreatePostModalVisible}
            onClose={() => setIsCreatePostModalVisible(false)}
            clubId={clubId}
            type="post"
            onSuccess={refreshClubData} // Refresh club data on success
          />

          {/* Modal for Creating Event */}
          <CreatePostOrEventModal
            isVisible={isCreateEventModalVisible}
            onClose={() => setIsCreateEventModalVisible(false)}
            clubId={clubId}
            type="event"
            onSuccess={refreshClubData} // Refresh club data on success
          />

          {/* Modal for Updating Club */}
          <Modal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            title={`Update Club`}
          >
            <Formik
              initialValues={{
                name: club.name || "",
                description: club.description || "",
                clubImage: null, // Handle the image in Dropzone
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string()
                  .required("Club name is required")
                  .min(3, "Name must be at least 3 characters"),
                description: Yup.string()
                  .required("Description is required")
                  .min(10, "Description must be at least 10 characters"),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setLoadingUpdate(true);
                try {
                  const formData = new FormData();
                  formData.append("name", values.name);
                  formData.append("description", values.description);
                  formData.append("clubImage", values.clubImage);

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}update-club/${clubId}`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                    }
                  );

                  if (!response.ok) {
                    throw new Error("Failed to update the club");
                  }

                  await response.json();
                  setIsModalVisible(false);
                  fetchClub();
                  resetForm();
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoadingUpdate(false);
                  setSubmitting(false);
                }
              }}
            >
              {({ setFieldValue, isSubmitting, values }) => (
                <Form>
                  {loadingUpdate && <Loading />}{" "}
                  {/* Show loading during update */}
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Club Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  {club.clubImage && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Club Image
                      </label>
                      <img
                        src={`http://localhost:7000/${club.clubImage
                          .replace("src\\", "")
                          .replace(/\\/g, "/")}`}
                        alt="Current Club Image"
                        className="w-full h-40 object-cover rounded-md mb-2"
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="clubImage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Club Image (Upload new to replace)
                    </label>
                    <ClubImageUpload setFieldValue={setFieldValue} />
                    <ErrorMessage
                      name="clubImage"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300 shadow-md"
                  >
                    {isSubmitting ? "Updating..." : "Update Club"}
                  </button>
                </Form>
              )}
            </Formik>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../components/Sidenav";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import ClubImageUpload from "../../components/ClubImageUpload"; // Import the Dropzone component
import Pagination from "../../components/Pagination"; // Import the reusable Pagination component
import WarningModal from "../../components/WarningModal"; // Import the WarningModal component
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // For validation

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true); // Specific loading state for clubs
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading state for adding a club
  const [loadingDelete, setLoadingDelete] = useState(false); // Loading state for deleting a club
  const [error, setError] = useState(null); // Error state for displaying in modal
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility for adding club
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false); // Control warning modal visibility
  const [clubToDelete, setClubToDelete] = useState(null); // Track the club to be deleted
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [page, setPage] = useState(0); // Page number for pagination (0-indexed for react-paginate)
  const [totalClubs, setTotalClubs] = useState(0); // Total number of clubs
  const [limit] = useState(3); // Results per page
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token) {
      fetchClubs(); // Fetch clubs on component mount
    } else {
      router.push("/login");
    }
  }, [page, searchQuery]); // Re-fetch when page or search query changes

  // Fetch all clubs or clubs based on search query and pagination
  const fetchClubs = async () => {
    setLoadingClubs(true); // Set loading only for clubs data
    setError(null); // Reset error on each fetch attempt
    try {
      const queryParam = searchQuery
        ? `&query=${encodeURIComponent(searchQuery)}`
        : ""; // Encode search query

      const endpoint = searchQuery
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/search-clubs?page=${
            page + 1
          }&limit=${limit}${queryParam}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/clubs?page=${
            page + 1
          }&limit=${limit}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clubs");
      }

      const data = await response.json();

      // Set clubs data and total clubs from backend response
      setClubs(data.result);
      setTotalClubs(data.totalClubs); // Assuming the backend provides `totalClubs`
    } catch (err) {
      console.error(err);
      setError("Failed to fetch clubs"); // Set error state
      setClubs([]); // Ensure clubs is reset to an empty array
    } finally {
      setLoadingClubs(false); // Set loading to false after fetch
    }
  };

  // Handle search on keyup with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(0); // Reset to the first page on search
      fetchClubs();
    }, 3000); // Delay in milliseconds

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle pagination page change
  const handlePageClick = (selectedPage) => {
    setPage(selectedPage.selected);
  };

  // Validation schema for the form using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Club name is required")
      .min(3, "Name must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters"),
    clubImage: Yup.mixed()
      .required("An image is required")
      .test("fileSize", "The file is too large", (value) => {
        return value && value.size <= 1024 * 1024 * 5; // 5MB file size limit
      }),
  });

  // Handle form submission using FormData and catch errors
  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    setLoadingSubmit(true); // Set loading state for submission
    const formData = new FormData();

    // Append form fields to FormData
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("clubImage", values.clubImage); // Append the file

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/club`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // Send FormData with the file and other fields
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.message &&
          errorData.message.includes("Club name already exists")
        ) {
          setErrors({ name: errorData.message }); // Set specific error for the name field
        } else {
          setError(errorData.message || "Failed to add the club");
        }
        return; // Stop further execution after error is set
      }

      // Reset to the first page and fetch the updated list of clubs
      setPage(0);
      fetchClubs(); // Fetch the updated list of clubs
      setIsModalVisible(false); // Close the modal
      resetForm(); // Reset the form after submission
    } catch (err) {
      setError("An error occurred while creating the club."); // General error
      console.error(err.message);
    } finally {
      setLoadingSubmit(false); // Set loading state to false
      setSubmitting(false);
    }
  };

  // Function to handle confirming the deletion of a club
  const handleConfirmDeleteClub = () => {
    if (clubToDelete) {
      setLoadingDelete(true); // Set loading state for delete
      handleDeleteClub(clubToDelete);
    }
  };

  // Function to delete a club
  const handleDeleteClub = async (clubId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-club/${clubId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete club");
      }

      // Update total clubs and fetch updated data
      const updatedTotalClubs = totalClubs - 1;

      // Check if the current page is empty after deleting the item
      const isPageEmptyAfterDelete = clubs.length === 1 && page > 0;

      // If the current page becomes empty, move to the previous page
      if (isPageEmptyAfterDelete) {
        setPage((prevPage) => prevPage - 1);
      } else {
        // Refetch the data on the current page
        fetchClubs();
      }

      // Update total clubs
      setTotalClubs(updatedTotalClubs);
    } catch (err) {
      console.error("Error deleting club:", err.message);
      setError("Failed to delete the club");
    } finally {
      setLoadingDelete(false); // Set loading state to false after delete
      setIsWarningModalVisible(false);
      setClubToDelete(null);
    }
  };

  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Clubs</h1>
          {/* Add Club Button */}
          <button
            onClick={() => setIsModalVisible(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Add Club
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for clubs..."
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
        />

        {/* Clubs List and Loading Indicator */}
        {loadingClubs ? (
          <Loading />
        ) : (
          <>
            {/* Show "No search results found" when search is active and results are empty */}
            {searchQuery && clubs.length === 0 ? (
              <div className="text-gray-600 text-center">
                No search results found.
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-gray-600 text-center">No clubs found.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubs.map((club) => (
                    <div
                      key={club._id}
                      className="bg-white shadow-lg p-6 rounded-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
                    >
                      {club.clubImage && (
                        <img
                          src={`http://localhost:7000/${club.clubImage
                            .replace("src\\", "")
                            .replace(/\\/g, "/")}`}
                          alt={club.name}
                          className="mb-4 w-full h-80 object-cover rounded-lg"
                        />
                      )}
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {club.name}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-4">
                        {club.description}
                      </p>
                      <div className="flex justify-between mt-auto">
                        <button
                          onClick={() => router.push(`/clubs/${club._id}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                        >
                          View Club
                        </button>
                        <button
                          onClick={() => {
                            setClubToDelete(club._id);
                            setIsWarningModalVisible(true);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                        >
                          Delete Club
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center mt-8">
                  <Pagination
                    pageCount={Math.ceil(totalClubs / limit)}
                    onPageChange={handlePageClick}
                    currentPage={page}
                  />
                </div>
              </>
            )}

            {/* Modal for Adding a New Club */}
            <Modal
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              title={`Add New Club`}
            >
              <Formik
                initialValues={{
                  name: "",
                  description: "",
                  clubImage: null,
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, isSubmitting, errors }) => (
                  <Form>
                    {loadingSubmit && <Loading />}{" "}
                    {/* Show loading during submission */}
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="clubImage"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Club Image
                      </label>
                      <ClubImageUpload setFieldValue={setFieldValue} />{" "}
                      {/* Dropzone for file upload */}
                      <ErrorMessage
                        name="clubImage"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    {/* Show general error inside the form, if any */}
                    {error && (
                      <div className="text-red-500 text-sm mb-4">{error}</div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      {isSubmitting ? "Submitting..." : "Add Club"}
                    </button>
                  </Form>
                )}
              </Formik>
            </Modal>

            {/* Warning Modal for Deleting Club */}
            <WarningModal
              isVisible={isWarningModalVisible}
              onClose={() => setIsWarningModalVisible(false)}
              onConfirm={handleConfirmDeleteClub}
            >
              {loadingDelete && <Loading />} {/* Show loading during delete */}
            </WarningModal>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;

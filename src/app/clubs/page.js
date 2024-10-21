"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../components/Sidenav";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import ClubImageUpload from "../../components/ClubImageUpload";
import Pagination from "../../components/Pagination";
import WarningModal from "../../components/WarningModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0); // Page number for pagination
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
  }, [page, searchQuery]);

  const fetchClubs = async () => {
    setLoadingClubs(true);
    setError(null);
    try {
      const queryParam = searchQuery
        ? `&query=${encodeURIComponent(searchQuery)}`
        : "";
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
      setClubs(data.result);
      setTotalClubs(data.totalClubs);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch clubs");
      setClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      fetchClubs();
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePageClick = (selectedPage) => {
    setPage(selectedPage.selected);
  };

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
        return value && value.size <= 1024 * 1024 * 5; // 5MB limit
      }),
  });

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    setLoadingSubmit(true);
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("clubImage", values.clubImage);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/club`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.message &&
          errorData.message.includes("Club name already exists")
        ) {
          setErrors({ name: errorData.message });
        } else {
          setError(errorData.message || "Failed to add the club");
        }
        return;
      }

      setPage(0);
      fetchClubs();
      setIsModalVisible(false);
      resetForm();
    } catch (err) {
      setError("An error occurred while creating the club.");
      console.error(err.message);
    } finally {
      setLoadingSubmit(false);
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteClub = () => {
    if (clubToDelete) {
      setLoadingDelete(true);
      handleDeleteClub(clubToDelete);
    }
  };

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

      const updatedTotalClubs = totalClubs - 1;
      const isPageEmptyAfterDelete = clubs.length === 1 && page > 0;

      if (isPageEmptyAfterDelete) {
        setPage((prevPage) => prevPage - 1);
      } else {
        fetchClubs();
      }

      setTotalClubs(updatedTotalClubs);
    } catch (err) {
      console.error("Error deleting club:", err.message);
      setError("Failed to delete the club");
    } finally {
      setLoadingDelete(false);
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
          <button
            onClick={() => setIsModalVisible(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Add Club
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for clubs..."
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
        />

        {loadingClubs ? (
          <Loading />
        ) : (
          <>
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

                <div className="flex justify-center mt-8">
                  <Pagination
                    pageCount={Math.ceil(totalClubs / limit)}
                    onPageChange={handlePageClick}
                    currentPage={page}
                  />
                </div>
              </>
            )}

            <Modal
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              title={`Add New Club`}
            >
              <Formik
                initialValues={{ name: "", description: "", clubImage: null }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, isSubmitting, errors }) => (
                  <Form>
                    {loadingSubmit && <Loading />}
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
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      {isSubmitting ? "Submitting..." : "Add Club"}
                    </button>
                  </Form>
                )}
              </Formik>
            </Modal>

            <WarningModal
              isVisible={isWarningModalVisible}
              onClose={() => setIsWarningModalVisible(false)}
              onConfirm={handleConfirmDeleteClub}
            >
              {loadingDelete && <Loading />}
            </WarningModal>
          </>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;

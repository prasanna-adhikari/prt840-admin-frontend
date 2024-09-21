"use client"; // Ensure it's the first line in your component file

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router in Next.js 13+
import Sidenav from "@/components/Sidenav";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination"; // Import the Pagination component
import { BsThreeDotsVertical } from "react-icons/bs"; // Icon for the three dots
import axios from "axios";

const UsersPage = () => {
  const [users, setUsers] = useState([]); // User data
  const [loading, setLoading] = useState(false); // For showing the loader
  const [error, setError] = useState(null); // Error state for displaying errors
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [page, setPage] = useState(0); // Page number for pagination (0-indexed for react-paginate)
  const [totalPages, setTotalPages] = useState(0); // Total number of pages for pagination
  const [totalUsers, setTotalUsers] = useState(0); // Total number of pages for pagination
  const [limit] = useState(3); // Limit per page
  const [menuVisible, setMenuVisible] = useState(null); // Track the visible dropdown for each user
  const menuRef = useRef(null); // Ref to track the dropdown menu for clicks outside
  const router = useRouter(); // Correct usage of router in Next.js App Router

  useEffect(() => {
    fetchUsers(); // Fetch users
  }, [page, searchQuery]);

  // Fetch users or search results from the API
  const fetchUsers = async () => {
    setLoading(true); // Show loader while fetching
    setError(null); // Reset any previous error
    try {
      const queryParam = searchQuery
        ? `&query=${encodeURIComponent(searchQuery)}`
        : "";
      const endpoint = searchQuery
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/search?page=${
            page + 1
          }&limit=${limit}${queryParam}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/view?page=${
            page + 1
          }&limit=${limit}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(response.data.result); // Set user data
      setTotalUsers(response.data.total);
      setTotalPages(response.data.totalPages); // Update total pages for pagination
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]); // Ensure users array is reset in case of error
    } finally {
      setLoading(false); // Hide loader after fetch is complete
    }
  };

  // Handle pagination page click
  const handlePageClick = (selectedPage) => {
    setPage(selectedPage.selected); // Set the selected page for pagination
  };

  // Handle search query input with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0); // Reset to first page on new search
  };

  // Toggle the menu visibility
  const toggleMenu = (userId) => {
    setMenuVisible(menuVisible === userId ? null : userId);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(null); // Close menu if click is outside the menu
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(users.filter((user) => user._id !== userId)); // Remove user from list
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  // Toggle verified status of a user
  const toggleVerifiedStatus = async (userId, currentStatus) => {
    try {
      // Optimistic UI update
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, verified: !currentStatus } : user
        )
      );

      // Send request to backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`,
        { isVerified: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      setError("Failed to update verification status");
    }
  };

  // Navigate to the profile view page
  const viewProfile = (userId) => {
    router.push(`/user/profile/${userId}`);
  };

  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-grow p-6 ml-64">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
        />
        {loading && <Loading />}
        {error && <div className="text-red-500">{error}</div>}
        {/* User list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading &&
            users.map((user) => (
              <div
                key={user._id}
                className="bg-white p-4 shadow rounded-lg flex flex-col items-center relative"
              >
                {/* Three dots menu */}
                <div className="absolute top-2 right-2">
                  <BsThreeDotsVertical
                    className="cursor-pointer"
                    onClick={() => toggleMenu(user._id)}
                  />
                  {menuVisible === user._id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 py-2 w-48 bg-white border rounded shadow-lg"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                        onClick={() =>
                          toggleVerifiedStatus(user._id, user.verified)
                        }
                      >
                        {user.verified ? "Unverify" : "Verify"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile image */}
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <img
                    src={
                      user.profileImage
                        ? `http://localhost:7000/${user.profileImage
                            .replace("src\\", "")
                            .replace(/\\/g, "/")}`
                        : "/default-avatar.png"
                    }
                    alt={user.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>

                {/* User Name */}
                <h2 className="text-lg font-semibold">{user.name}</h2>

                {/* Role and Badge */}
                <p className="text-gray-600 flex items-center">
                  {user.role}
                  <span
                    onClick={() =>
                      toggleVerifiedStatus(user._id, user.verified)
                    }
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      user.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.verified ? "verified" : "unverified"}
                  </span>
                </p>

                {/* View Profile Button */}
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => viewProfile(user._id)}
                >
                  View Profile
                </button>
              </div>
            ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-center">
          <Pagination
            pageCount={Math.ceil(totalUsers / limit)}
            onPageChange={handlePageClick}
            currentPage={page}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

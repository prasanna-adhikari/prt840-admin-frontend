"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "@/components/Sidenav";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(4);
  const [menuVisible, setMenuVisible] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
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

      setUsers(response.data.result);
      setTotalUsers(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (selectedPage) => {
    setPage(selectedPage.selected);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const toggleMenu = (userId) => {
    setMenuVisible(menuVisible === userId ? null : userId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleDeleteUser = async (userId) => {
    setLoadingAction(userId);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleVerifiedStatus = async (userId, currentStatus) => {
    setLoadingAction(userId);
    try {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, verified: !currentStatus } : user
        )
      );

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
    } finally {
      setLoadingAction(null);
    }
  };

  const viewProfile = (userId) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-grow p-6 ml-64">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
        />

        {loading && <Loading />}
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading &&
            users.map((user) => (
              <div
                key={user._id}
                className="bg-white p-4 shadow rounded-lg flex flex-col items-center relative"
              >
                {loadingAction === user._id && <Loading />}

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
                    className="w-40 h-40 object-cover"
                  />
                </div>

                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-gray-600">
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

                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-700"
                  onClick={() => viewProfile(user._id)}
                >
                  View Profile
                </button>
              </div>
            ))}
        </div>

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

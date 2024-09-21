"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidenav from "@/components/Sidenav";
import Loading from "@/components/Loading";
import axios from "axios";

const UserProfilePage = ({ params }) => {
  const [user, setUser] = useState(null); // State for user data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const router = useRouter();
  const { userId } = params; // Get userId from URL

  useEffect(() => {
    // Fetch the user profile data
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data.result); // Set the fetched user data
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-grow p-6 ml-64">
        <h1 className="text-2xl font-bold mb-6">{user?.name}'s Profile</h1>
        <div className="bg-white p-6 shadow rounded-lg">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <img
              src={
                user?.profileImage
                  ? `${process.env.IMAGE_URL}${user.profileImage
                      .replace("src\\", "")
                      .replace(/\\/g, "/")}`
                  : "/default-avatar.png"
              }
              alt={user?.name}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          {/* User Details */}
          <div>
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
            <p>
              <strong>Verified:</strong> {user?.verified ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

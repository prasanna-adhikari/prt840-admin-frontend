"use client";

import { useState, useEffect } from "react";
import Sidenav from "@/components/Sidenav";
import Loading from "@/components/Loading";
import axios from "axios";
import { FaUserFriends, FaUsers, FaCheckCircle } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const UserProfilePage = ({ params }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: userId } = params;

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}user/view/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data.result);
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidenav />
      <div className="flex-grow p-8 md:ml-64">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          {user?.name}'s Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1 bg-white p-8 shadow-lg rounded-lg">
            <div className="flex flex-col items-center mb-6">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:7000/${user.profileImage
                    .replace("src\\", "")
                    .replace(/\\/g, "/")}`}
                  alt={user?.name}
                  className="w-40 h-40 rounded-full object-cover mb-4 hover:opacity-90 transition"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-300 flex items-center justify-center rounded-full text-white text-3xl font-semibold mb-4">
                  {user?.name?.[0] || "?"}
                </div>
              )}

              <h2 className="text-2xl font-semibold mb-2">{user?.name}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <p className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                {user?.verified ? "Verified" : "Not Verified"}
              </p>
            </div>

            <div className="space-y-4 text-center lg:text-left">
              <p>
                <strong>Role:</strong> {user?.role || "N/A"}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Friends and Following Clubs Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Friends Section */}
            <div className="bg-white p-8 shadow-lg rounded-lg">
              <div className="flex items-center mb-6">
                <FaUserFriends className="text-2xl text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold">Friends</h3>
              </div>
              {user?.friends?.length > 0 ? (
                <Swiper
                  spaceBetween={16}
                  slidesPerView={3}
                  navigation
                  modules={[Navigation]}
                >
                  {user.friends.map((friend) => (
                    <SwiperSlide key={friend._id}>
                      <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-md">
                        <img
                          src={`http://localhost:7000/${friend.profileImage
                            .replace("src\\", "")
                            .replace(/\\/g, "/")}`}
                          alt={friend.name}
                          className="w-24 h-24 rounded-full mb-4 object-cover"
                        />
                        <p className="font-semibold text-center">
                          {friend.name}
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                          {friend.email}
                        </p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <p className="text-gray-500">No friends to show</p>
              )}
            </div>

            {/* Following Clubs Section */}
            <div className="bg-white p-8 shadow-lg rounded-lg">
              <div className="flex items-center mb-6">
                <FaUsers className="text-2xl text-green-500 mr-3" />
                <h3 className="text-xl font-semibold">Following Clubs</h3>
              </div>
              {user?.followingClubs?.length > 0 ? (
                <Swiper
                  spaceBetween={16}
                  slidesPerView={3}
                  navigation
                  modules={[Navigation]}
                >
                  {user.followingClubs.map((club) => (
                    <SwiperSlide key={club._id}>
                      <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                        <img
                          src={`http://localhost:7000/${club.clubImage
                            .replace("src\\", "")
                            .replace(/\\/g, "/")}`}
                          alt={club.name}
                          className="w-24 h-24 rounded-full mb-4 object-cover"
                        />
                        <p className="font-semibold text-lg text-center">
                          {club.name}
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                          {club.email}
                        </p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <p className="text-gray-500">No clubs followed</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

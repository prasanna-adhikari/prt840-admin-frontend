"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../components/Sidenav";
import Loading from "../../components/Loading";
import axios from "axios";
import {
  FaUsers,
  FaUserShield,
  FaClipboardList,
  FaRegNewspaper,
  FaUserEdit,
  FaUsersCog,
  FaRegBuilding,
} from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin" && parsedUser.role !== "superuser") {
        throw new Error("Access denied");
      }

      setUser(parsedUser);
      setProfile({ name: parsedUser.name, email: parsedUser.email });
      fetchProfileImage(token);
      setLoading(false);
      fetchMetrics(token);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const fetchMetrics = async (token) => {
    setMetricsLoading(true);
    try {
      const [userResponse, clubResponse, postResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}user/view`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}clubs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const unverifiedUsersCount = userResponse.data.result.filter(
        (user) => !user.verified
      ).length;

      setMetrics({
        totalUsers: userResponse.data.total || 0,
        totalUnverifiedUsers: unverifiedUsersCount,
        totalClubs: clubResponse.data.totalClubs || 0,
        totalPosts: postResponse.data.total || 0,
      });
      setMetricsLoading(false);
    } catch (error) {
      console.error("Error fetching metrics", error);
      setMetricsLoading(false);
    }
  };

  const fetchProfileImage = async (token) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user/view-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const profileImageUrl = response.data.result.user.profileImage;
      setCurrentProfileImage(profileImageUrl);
    } catch (error) {
      console.error("Error fetching profile image", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    },
  });

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user/update-profile`,
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const handleProfileImageUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newProfileImageUrl = response.data.result.user.profileImage;

      const updatedUser = { ...user, profileImage: newProfileImageUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setCurrentProfileImage(newProfileImageUrl);
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating profile image", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user/change-password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password", error);
    }
  };

  const pieChartData = {
    labels: ["Verified Users", "Unverified Users"],
    datasets: [
      {
        data: [
          metrics.totalUsers - metrics.totalUnverifiedUsers,
          metrics.totalUnverifiedUsers,
        ],
        backgroundColor: ["#4caf50", "#f44336"],
        hoverBackgroundColor: ["#66bb6a", "#ef5350"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen ml-64">
        <h1 className="text-4xl font-bold mb-6">Dashboard Overview</h1>
        <div className="flex justify-end mb-4">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            onClick={() => setShowProfile(!showProfile)}
          >
            <FaUserEdit className="inline mr-2" />
            {showProfile ? "Back to Dashboard" : "Edit Profile"}
          </button>
        </div>

        {showProfile ? (
          <div className="bg-white shadow-md p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <form onSubmit={handleProfileImageUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700">
                  Current Profile Image
                </label>
                {currentProfileImage && (
                  <div className="mt-2">
                    <img
                      src={`http://localhost:7000/${user.profileImage
                        .replace("src\\", "")
                        .replace(/\\/g, "/")}`}
                      alt="Current Profile"
                      className="h-32 w-32 object-cover rounded-full"
                    />
                  </div>
                )}
                <label className="block text-gray-700 mt-4">
                  New Profile Image
                </label>
                <div
                  {...getRootProps({
                    className:
                      "border-2 border-dashed border-gray-300 p-4 rounded-lg",
                  })}
                >
                  <input {...getInputProps()} />
                  <p>
                    Drag 'n' drop a profile image here, or click to select one
                  </p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="New Profile Preview"
                      className="h-32 w-32 object-cover rounded-full"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600"
                >
                  Update Image
                </button>
              </div>
            </form>

            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              onClick={handleProfileUpdate}
            >
              Save Changes
            </button>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <div className="mb-4">
                <label className="block text-gray-700">Current Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white shadow-md p-6 rounded-lg flex items-center">
                <FaUsers className="text-blue-500 text-3xl mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Total Users</h2>
                  <p className="text-gray-600 mt-2">
                    {metricsLoading ? "Loading..." : metrics.totalUsers}
                  </p>
                </div>
              </div>

              <div className="bg-white shadow-md p-6 rounded-lg flex items-center">
                <FaUserShield className="text-red-500 text-3xl mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Unverified Users</h2>
                  <p className="text-gray-600 mt-2">
                    {metricsLoading
                      ? "Loading..."
                      : metrics.totalUnverifiedUsers}
                  </p>
                </div>
              </div>

              <div className="bg-white shadow-md p-6 rounded-lg flex items-center">
                <FaClipboardList className="text-green-500 text-3xl mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Total Clubs</h2>
                  <p className="text-gray-600 mt-2">
                    {metricsLoading ? "Loading..." : metrics.totalClubs}
                  </p>
                </div>
              </div>

              <div className="bg-white shadow-md p-6 rounded-lg flex items-center">
                <FaRegNewspaper className="text-purple-500 text-3xl mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">Total Posts</h2>
                  <p className="text-gray-600 mt-2">
                    {metricsLoading ? "Loading..." : metrics.totalPosts}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push("/clubs")}
                    className="bg-blue-500 text-white p-4 rounded-lg flex items-center justify-center gap-3 hover:bg-blue-600 transition-all"
                  >
                    <FaRegBuilding className="text-white text-2xl" />
                    Manage Clubs
                  </button>
                  <button
                    onClick={() => router.push("/users")}
                    className="bg-green-500 text-white p-4 rounded-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all"
                  >
                    <FaUsersCog className="text-white text-2xl" />
                    Manage Users
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 shadow-md rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">
                  User Verification Status
                </h2>
                <div className="h-64">
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

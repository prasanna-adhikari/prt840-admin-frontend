"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../../components/Sidenav";

const ClubDetails = ({ params }) => {
  const { id } = params;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchClub = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs/${id}`,
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

    fetchClub();
  }, [id, router]);

  // Function to format the image path for use in the frontend
  const formatImagePath = (path) => {
    if (!path) return null;
    // Remove 'src\\' and replace backslashes with forward slashes
    return `http://localhost:7000/${path
      .replace("src\\", "")
      .replace(/\\/g, "/")}`;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!club) {
    return <p>Club not found.</p>;
  }

  return (
    <div className="flex">
      {/* Sidenav component */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6">{club.name}</h1>
        <p className="text-lg mb-4">{club.description}</p>
        {club.clubImage && (
          <img
            src={formatImagePath(club.clubImage)}
            alt={club.name}
            className="w-full"
          />
        )}
        {/* Add buttons for Edit or Delete if required */}
      </div>
    </div>
  );
};

export default ClubDetails;

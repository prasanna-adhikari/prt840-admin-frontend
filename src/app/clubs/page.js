"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../components/Sidenav";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchClubs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}clubs`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }

        const data = await response.json();
        setClubs(data.result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClubs();
  }, [router]);

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

  return (
    <div className="flex">
      {/* Sidenav component */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6">Clubs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div key={club._id} className="bg-white shadow-md p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{club.name}</h2>
              <p>{club.description}</p>
              {club.clubImage && (
                <img
                  src={formatImagePath(club.clubImage)}
                  alt={club.name}
                  className="mt-4 w-full"
                />
              )}
              <button
                onClick={() => router.push(`/clubs/${club._id}`)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                View Club
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubsPage;

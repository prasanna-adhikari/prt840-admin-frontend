"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "../../components/Sidenav";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex">
      {/* Sidenav component */}
      <Sidenav />
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Dashboard</h1>
        <p className="text-xl mb-4">Hello, {user.email}!</p>
        <p className="text-lg">Role: {user.role}</p>
      </div>
    </div>
  );
};

export default DashboardPage;

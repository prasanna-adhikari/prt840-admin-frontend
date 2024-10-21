"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Sidenav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleNavigation = (route) => {
    setLoading(true);
    router.push(route);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white shadow-lg flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-grow mt-10">
        <ul>
          <li
            onClick={() => handleNavigation("/dashboard")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname === "/dashboard" ? "bg-gray-700" : ""
            }`}
          >
            Dashboard
          </li>
          <li
            onClick={() => handleNavigation("/clubs")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname.startsWith("/clubs") ? "bg-gray-700" : ""
            }`}
          >
            Clubs
          </li>
          <li
            onClick={() => handleNavigation("/users")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname.startsWith("/users") ? "bg-gray-700" : ""
            }`}
          >
            Users
          </li>
        </ul>
      </nav>
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition duration-300"
        >
          Logout
        </button>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default Sidenav;

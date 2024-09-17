"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const Sidenav = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname

  // Log the current pathname for debugging
  console.log("Current Pathname:", pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-grow mt-10">
        <ul>
          <li
            onClick={() => router.push("/dashboard")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname === "/dashboard" ? "bg-gray-700" : ""
            }`}
          >
            Dashboard
          </li>
          <li
            onClick={() => router.push("/clubs")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname.startsWith("/clubs") ? "bg-gray-700" : ""
            }`}
          >
            Clubs
          </li>
          <li
            onClick={() => router.push("/settings")}
            className={`p-4 cursor-pointer hover:bg-gray-700 ${
              pathname === "/settings" ? "bg-gray-700" : ""
            }`}
          >
            Settings
          </li>
        </ul>
      </nav>
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidenav;

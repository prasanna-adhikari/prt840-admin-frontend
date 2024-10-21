"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const { role } = data.result;

      if (role !== "admin" && role !== "superuser") {
        throw new Error(
          "Access denied. Only admins and superusers can log in."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.result));
      setIsLoading(false);
      router.push("/dashboard");
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Admin Login
        </h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full p-2 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-sm text-gray-600 mb-2"
            htmlFor="password"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full p-2 rounded"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {isLoading ? (
          <button
            type="button"
            disabled
            className="w-full bg-blue-500 text-white py-2 rounded opacity-50 cursor-not-allowed"
          >
            Logging in...
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition duration-300"
          >
            Login
          </button>
        )}
      </form>
    </div>
  );
};

export default LoginPage;

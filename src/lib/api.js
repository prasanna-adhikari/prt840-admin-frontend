export const apiRequest = async (
  endpoint,
  method,
  body = null,
  token = null
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  // If a token is provided, add it to the headers for authentication
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

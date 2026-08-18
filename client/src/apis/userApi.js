import api from "../lib/axios";

export async function fetchUser() {
  try {
    const { data } = await api.get("/user");

    setUserName(data.name);
    setUserEmail(data.email);
    setProfile(data.profile);
    setLoggedIn(true);

    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      setProfile(null);
      setLoggedIn(false);

      return null;
    }

    console.error(
      "Error fetching user info:",
      error.response?.data || error.message
    );

    throw error;
  }
}
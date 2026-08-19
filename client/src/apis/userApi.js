import api from "../lib/axios";
import { showErrorToast } from "../lib/errorToast";

export async function fetchUser() {
  try {
    const { data } = await api.get("/user");
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    showErrorToast(error, "Failed to fetch user info");
    throw error;
  }
}

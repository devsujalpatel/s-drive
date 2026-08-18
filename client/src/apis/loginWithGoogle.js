import api from "../lib/axios";

export const loginWithGoogle = async (idToken) => {
  const { data } = await api.post("/auth/google", {
    idToken,
  });

  return data;
};

import api from "../lib/axios";

export const uploadInitiate = async (fileData) => {
  const { data } = await api.post(`/file/upload/initiate`, {
    fileData,
  })

  return data;
}

import { toast } from "sonner";

export function getErrorMessage(error, fallback = "Something went wrong") {
  const responseData = error?.response?.data;

  if (typeof responseData === "string") return responseData;

  return (
    responseData?.error ||
    responseData?.message ||
    error?.message ||
    fallback
  );
}

export function showErrorToast(error, fallback = "Something went wrong") {
  toast.error(fallback, {
    description: getErrorMessage(error, fallback),
    duration: 6000,
  });
}

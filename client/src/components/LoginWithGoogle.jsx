import { loginWithGoogle } from "../apis/loginWithGoogle";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export const LoginWithGoogle = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
      <p className="mb-4 text-center text-sm text-neutral-500">
        Continue securely with your Google account
      </p>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const data = await loginWithGoogle(
              credentialResponse.credential
            );

            if (data.error) {
              console.error(data.error);
              return;
            }

            navigate("/");
          }}
          onError={() => console.error("Login Failed")}
          width="320"
          theme="filled_blue"
          shape="pill"
          size="large"
          text="continue_with"
          logo_alignment="left"
          useOneTap
        />
      </div>

      <p className="mt-4 text-center text-xs text-neutral-400">
        We only use your Google account for authentication.
      </p>
    </div>
  );
};
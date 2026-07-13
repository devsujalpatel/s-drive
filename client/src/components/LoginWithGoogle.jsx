import { loginWithGoogle } from "../apis/loginWithGoogle";
import "./google.css";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export const LoginWithGoogle = () => {
  const navigate = useNavigate();
  return (
    <div className="google-login">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const data = await loginWithGoogle(credentialResponse.credential);
          if (data.error) {
            console.log(data.error);
            return;
          }
          navigate("/");
        }}
        width={"400px"}
        shape="pill"
        theme="filled_blue"
        text="continue_with"
        useOneTap
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
};

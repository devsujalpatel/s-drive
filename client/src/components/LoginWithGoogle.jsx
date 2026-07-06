import "./google.css";

export const LoginWithGoogle = () => {

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `http://localhost:5173/code`;

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&redirect_uri=${redirectUri}&state=security_token%3D138r5719ru3e1%26url%3Dhttps%3A%2F%2Foauth2-login-demo.example.com%2FmyHome&login_hint=jsmith@example.com&nonce=0394852-3190485-2490358&hd=example.com`;
  
  const handleGoogleLogin = () => {
    window.location.href = googleOAuthUrl;
  };

  return (
    <div>
      <button className="google-button" onClick={handleGoogleLogin}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
        />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

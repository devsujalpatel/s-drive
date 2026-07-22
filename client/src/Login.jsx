import "./Auth.css";
import { LoginWithGoogle } from "./components/LoginWithGoogle";

import { HardDrive } from "lucide-react";

const Login = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-neutral-50 via-white to-neutral-100 px-6">
      {/* Background Blur */}
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white/80 p-10 shadow-2xl backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <HardDrive className="h-8 w-8 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Welcome to Drive
          </h1>

          <p className="text-sm leading-6 text-neutral-600">
            Store, organize, and access your files securely from anywhere. Sign
            in with your Google account to continue.
          </p>
        </div>

        <div className="mt-8">
          <LoginWithGoogle />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;

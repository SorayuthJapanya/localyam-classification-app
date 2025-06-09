import React from "react";
import { Link } from "react-router-dom";
import LogInForm from "../../components/auth/LogInForm";

const LoginPage = () => {
  return (
    <div className="min-h-160 flex flex-col items-center justify-center">
      <div className="bg-content/10 rounded-lg shadow-2xl max-w-lg w-full px-8 py-2">
        <LogInForm />
      </div>
      <p className="mt-5 text-main">
        Don't have an account?{" "}
        <Link to="/signup" className="text-violet-800 cursor-pointer">
          Signup
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

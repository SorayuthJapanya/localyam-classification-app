import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "../../components/auth/SignUpForm";

const SignupPage = () => {
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  return (
    <div className="min-h-160 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center my-10">
        <div className="bg-content/10 rounded-lg shadow-2xl max-w-lg w-full px-8 py-2 ">
          <SignupForm />
        </div>
        <div className="mt-10">
          {!isAdmin && (
            <p className="mt-5 text-main">
              Already have an accout?{" "}
              <Link to="/login" className="text-violet-800 cursor-pointer">
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

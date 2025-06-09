import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  return (
    <>
      <NavBar />
      <div className="w-full bg-gray-50 flex flex-col relation min-h-screen">
        <Outlet />
        <Toaster />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;

import { Outlet } from "react-router-dom";

const BlankLayout = () => {
  return (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  );
};

export default BlankLayout;

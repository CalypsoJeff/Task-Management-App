import { Route, Routes } from "react-router-dom";
import Home from "../../pages/user/Home";
import Login from "../../pages/user/Login";
import UserPrivateRoutes from "./UserPrivateRoutes";
import Register from "../../pages/user/Register";
import Otp from "../../pages/user/Otp";
import Dashboard from "../../pages/user/Dashboard";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/" element={<Home />} />
      
      {/* Private Routes */}
      <Route element={<UserPrivateRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;

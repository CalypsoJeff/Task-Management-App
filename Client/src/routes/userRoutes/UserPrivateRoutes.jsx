import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { isLoggedIn } from "../../features/auth/authSlice";

const PrivateRoute = () => {
  const loggedIn = useSelector(isLoggedIn);

  return loggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { isLoggedIn, selectUser, logout } from "../../features/auth/authSlice";
import Cookies from "js-cookie";
import { Link } from "react-router";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector(selectUser);
  const loggedIn = useSelector(isLoggedIn);
  const dispatch = useDispatch();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Dispatch the logout action
    dispatch(logout());
    // Clear cookies if tokens are stored
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    console.log("Logged out");
  };

  return (
    <header className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <span className="text-xl font-bold">/Task Management App</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {loggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-700"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <span className="text-xl font-bold">/ORCA</span>
              </a>
            </div>
            <button
              type="button"
              className="text-gray-700"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 pt-8">
            <div className="flex flex-col space-y-8">
              {loggedIn ? (
                <>
                  <span className="text-lg text-gray-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-full bg-red-500 px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="rounded-full bg-black px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Sign up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

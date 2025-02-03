  import "./App.css";
  import { Routes, Route } from "react-router-dom";
  import UserRoutes from "./routes/userRoutes/UserRoutes";
  import { ToastContainer } from "react-toastify";

  function App() {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </>
    );
  }

  export default App;

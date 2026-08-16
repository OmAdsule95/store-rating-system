import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";


// ==================================================
// APP
// ==================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================================
            LOGIN
        ========================================= */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* =========================================
            REGISTER
        ========================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================================
            USER / CUSTOMER
        ========================================= */}

        <Route
          path="/user"
          element={<UserDashboard />}
        />


        {/* =========================================
            ADMIN
        ========================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* =========================================
            OWNER
        ========================================= */}

        <Route
          path="/owner"
          element={<OwnerDashboard />}
        />


        {/* =========================================
            OLD DASHBOARD PATH
            Redirect to USER page
        ========================================= */}

        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/user"
              replace
            />
          }
        />


        {/* =========================================
            UNKNOWN PAGE
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;
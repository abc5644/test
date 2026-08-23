import { Routes, Route, Navigate } from "react-router-dom";
import Intro from "./pages/Intro.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import HomeMap from "./pages/HomeMap.jsx";
import Profile from "./pages/Profile.jsx";
import Community from "./pages/Community.jsx";
import NavBar from "./components/NavBar.jsx";
import { isLoggedIn } from "./api.js";

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return (
    <>
      <NavBar />
      {/* padding-top clears the fixed nav bar; box-sizing keeps the math simple */}
      <div style={{ paddingTop: 48, height: "100vh", boxSizing: "border-box" }}>{children}</div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomeMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Logout from "./components/Logout";
import UserProfile from "./components/UserProfile"; // Import UserProfile

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/profile" element={<UserProfile />} /> {/* Add UserProfile route */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
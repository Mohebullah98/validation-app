import React from "react";
import Form from "./Form";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Signup" element={<Signup />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;

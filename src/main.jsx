import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
const isAdminRoute = window.location.pathname === "/admin" || new URLSearchParams(window.location.search).has("admin");

if (isAdminRoute) {
  import("./AdminDashboard.jsx").then(({ default: AdminDashboard }) => {
    root.render(<React.StrictMode><AdminDashboard /></React.StrictMode>);
  });
} else {
  import("./App.jsx").then(({ App }) => {
    root.render(<React.StrictMode><App /></React.StrictMode>);
  });
}

import './video-enhancement.js';

import './fonts.css';

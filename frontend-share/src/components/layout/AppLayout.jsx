import React from "react";
import "../../styles/global.css";

export default function AppLayout({ children }) {
  return <div className="app-container">{children}</div>;
}
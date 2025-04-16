import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./pages/header"
import About from "./pages/about";
import Docs from "./pages/docs";

export default function App() {
  return (
    <div className="page">
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </div>
    </div>
  );
}
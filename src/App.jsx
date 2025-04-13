import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./header";
import About from "./about";
import Blog from "./blog";

export default function App() {
  return (
    <div className="page">
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/docs" element={<Blog />} />
        </Routes>
      </div>
    </div>
  );
}
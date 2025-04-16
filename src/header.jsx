import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

export default function Header() {
  return (
    <div className="header">
      <button
        className="avatar-button"
        onClick={() =>
          window.open("https://github.com/MTPruett-DevOps/help", "_blank", "noopener,noreferrer")
        }
        aria-label="Open GitHub repository"
      >
        <img
          src="https://github.com/pruettmt.png"
          alt="MT Pruett GitHub Profile"
          className="avatar"
        />
      </button>
      <h1>
        <Link to="/" className="name-link">MT Pruett</Link>
      </h1>
    </div>
  );
}
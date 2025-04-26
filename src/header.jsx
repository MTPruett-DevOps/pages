import React from "react";

export default function Header() {
  return (
    <div className="header">
      <button
        className="avatar-button"
        onClick={() => window.open("https://github.com/MTPruett-DevOps/help", "_blank")}
        aria-label="GitHub"
      >
        <img src="https://github.com/pruettmt.png" alt="MT Pruett" className="avatar" />
      </button>
      <h1>
        <a
          className="name-link"
          href="https://www.linkedin.com/in/mtpruett/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MT Pruett
        </a>
      </h1>
    </div>
  );
}
import './header.css';
import React, { useState } from "react";

export default function Header() {
  const [selected, setSelected] = useState("");

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    if (value) {
      window.open(value, "_blank");
      setSelected(""); // ✅ Reset dropdown back to "Find Me" after opening link
    }
  };

  return (
    <div className="header">
      <div className="avatar-wrapper">
        <img src="https://github.com/pruettmt.png" alt="MT Pruett" className="avatar" />
      </div>

      <div className="name-block">
        <h1 className="name-text">
          MT Pruett
        </h1>

        <select
          className="header-dropdown"
          onChange={handleDropdownChange}
          value={selected}
        >
          {selected === "" && (
            <option value="" hidden>Find Me</option> 
          )}
          <option value="https://github.com/MTPruett-DevOps/Help">GitHub</option>
          <option value="https://www.linkedin.com/in/mtpruett/">LinkedIn</option>
        </select>
      </div>
    </div>
  );
}
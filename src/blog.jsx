import React from "react";
import { Link } from "react-router-dom";

export default function blog() {
  return (
    <div>
      <h2 ><Link to="/">About</Link> / <Link to="/docs">Docs</Link></h2>
      <p>Coming soon.</p>
    </div>
  );
}

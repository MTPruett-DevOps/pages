import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [docsMode, setDocsMode] = useState(false);
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const transitionToDocs = (e) => {
    e.preventDefault();
    setAboutCollapsed(true); // trigger fade-out
    setShowButtons(false);   // hide docs buttons just in case
    setTimeout(() => {
      setDocsMode(true);     // now remove About and show Docs
      setShowButtons(true);
    }, 400); // match animation
  };

  const returnToAbout = () => {
    setFadingOut(true); // fade out buttons
    setTimeout(() => {
      setShowButtons(false);
      setDocsMode(false);         // show about again
      setFadingOut(false);
      setAboutCollapsed(false);   // fade about back in
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };

  return (
    <div className="container">
      {/* Header */}
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

      {/* About Section */}
      {!docsMode && (
        <div className={`about-section ${aboutCollapsed ? "fade-out-down" : "fade-in"}`}>
          <p style={{ marginBottom: "2rem" }}>
            If you want to skip the intro, I don’t blame you —{" "}
            <a href="#" onClick={transitionToDocs} className="skip-doc-link">
              jump straight to the documentation.
            </a>
          </p>

          <p>I'm a DevOps engineer who lives in Azure, Terraform, and Databricks.</p>

          <p>
            Most of my day-to-day is spent building cloud infrastructure that doesn't fall apart under pressure —
            automating the boring stuff, tightening up CI/CD pipelines, managing Databricks (Unity Catalog included),
            and helping teams move faster without breaking things. If there's a way to script it, automate it, or monitor it... I'm on it.
          </p>

          <p>
            I've learned (sometimes the hard way) how to keep cloud environments clean, secure, and scalable.
            Most of us don’t get to pick our stack — we use what the job calls for. This blog reflects that:
            the tools I’ve used, the problems I’ve hit, and the stuff I wish I knew sooner.
          </p>

          <p>
            The cloud’s always changing — and sometimes (more than we'd like) it breaks. This blog is where I share what I’m learning,
            what I’ve messed up, and what actually works. If it saves you some pain, that’s a win.
          </p>

          <h3>What I use a lot:</h3>
          <ul>
            <li>Azure (infra, security, automation, monitoring — the usual suspects)</li>
            <li>Terraform (IaC modules, state management, CI integration)</li>
            <li>Databricks (workspace admin, Unity Catalog, job orchestration, ACLs)</li>
            <li>CI/CD: GitHub Actions, Azure DevOps, Octopus</li>
            <li>Scripting: PowerShell, Bash, SQL, Git, C# (primarily for internal tooling, not full-scale development)</li>
            <li>Tooling: VS Code, Git, terminal life</li>
          </ul>

          <p>Thanks for dropping by.</p>

          <p>
            Just a heads up — I assume tools like Terraform, Git, VS Code, and any CLIs are already installed if you’re following along.
            I'll try to skip the setup fluff and get right to the good stuff.
          </p>

          <p>
            I take security seriously — so all sensitive tokens will be scrubbed out, and if I’m sharing real-world configs,
            resource names and GUIDs will be too. Sometimes it might feel like overkill, but better safe than sorry.
          </p>
        </div>
      )}

      {/* Docs Buttons */}
      <div
        className={`main-buttons ${docsMode && showButtons
          ? fadingOut ? "fade-out" : "fade-in"
          : "hidden"}`}
      >
        <button className="nav-button" onClick={returnToAbout}>About</button>
        <button className="nav-button">Setups</button>
        <button className="nav-button">Architecture</button>
        <button className="nav-button">Posts</button>
      </div>
    </div>
  );
}
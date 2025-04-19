import React, { useState } from "react";
import "./App.css";

// Load markdown files from folders inside ./posts/
const fileMap = import.meta.glob("./posts/*/*.md", { eager: true, as: "raw" });

// Group files by folder (skip bad paths)
const folderToPosts = {};
Object.keys(fileMap).forEach((path) => {
  const segments = path.split("/");
  if (segments.length < 4) return;

  const folder = segments[2];
  const file = segments[3];

  if (!folderToPosts[folder]) folderToPosts[folder] = [];
  folderToPosts[folder].push(file.replace(".md", ""));
});

const postFolders = Object.keys(folderToPosts);

export default function App() {
  const [docsMode, setDocsMode] = useState(false);
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [showPostFolders, setShowPostFolders] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState(null);

  const transitionToDocs = (e) => {
    e.preventDefault();
    setAboutCollapsed(true);
    setTimeout(() => {
      setDocsMode(true);
      setShowPostFolders(true);
    }, 400);
  };

  const returnToAbout = () => {
    setFadingOut(true);
    setTimeout(() => {
      setShowPostFolders(false);
      setDocsMode(false);
      setAboutCollapsed(false);
      setExpandedFolder(null);
      setFadingOut(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };

  const toggleFolder = (folder) => {
    setExpandedFolder((prev) => (prev === folder ? null : folder));
  };

  return (
    <div className="container">
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
            and helping teams move faster without breaking things.
          </p>
          <p>
            I've learned (sometimes the hard way) how to keep cloud environments clean, secure, and scalable.
            This blog reflects that: the tools I’ve used, the problems I’ve hit, and the stuff I wish I knew sooner.
          </p>
          <p>
            The cloud’s always changing — and sometimes (more than we'd like) it breaks. This blog is where I share what I’m learning,
            what I’ve messed up, and what actually works. If it saves you some pain, that’s a win.
          </p>

          <h3>What I use a lot:</h3>
          <ul>
            <li>Azure</li>
            <li>Terraform</li>
            <li>Databricks</li>
            <li>CI/CD: GitHub Actions, Azure DevOps, Octopus</li>
            <li>Scripting: PowerShell, Bash, SQL, Git, C#</li>
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

      {docsMode && (
        <div className={`main-buttons ${fadingOut ? "fade-out" : "fade-in"}`}>
          {[{ label: "About", onClick: returnToAbout }, ...postFolders.map((folder) => {
            const label = folder
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            return { label, folder };
          })].map((item) => {
            const isFolder = !!item.folder;
            const isOpen = expandedFolder === item.folder;

            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "1rem"
                }}
              >
                <button
                  className="nav-button"
                  onClick={() => (isFolder ? toggleFolder(item.folder) : item.onClick())}
                >
                  {item.label}
                </button>

                {isFolder && isOpen &&
                  folderToPosts[item.folder]?.map((post) => (
                    <button key={post} className="nav-button fade-in" style={{ marginTop: "0.3rem" }}>
                      {post}
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
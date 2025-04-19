import React, { useState } from "react";
import "./App.css";
import { marked } from "marked";
import About from "./about"; // updated lowercase + direct from src

const allPostFiles = import.meta.glob("./posts/**/*.md", { as: "raw" });

const folderToPosts = {};
Object.keys(allPostFiles).forEach((path) => {
  const parts = path.split("/");
  const folder = parts[2];
  const file = parts[3];
  if (!folderToPosts[folder]) folderToPosts[folder] = [];
  folderToPosts[folder].push(path);
});

function formatPostTitle(path) {
  const file = path.split("/").pop().replace(/\.md$/, "");
  return file.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function App() {
  const [docsMode, setDocsMode] = useState(false);
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [activeFolders, setActiveFolders] = useState(new Set());
  const [postContent, setPostContent] = useState("");

  const transitionToDocs = (e) => {
    e.preventDefault();
    setAboutCollapsed(true);
    setTimeout(() => setDocsMode(true), 400);
  };

  const returnToAbout = () => {
    setFadingOut(true);
    setTimeout(() => {
      setPostContent("");
      setActiveFolders(new Set());
      setDocsMode(false);
      setAboutCollapsed(false);
      setFadingOut(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };

  const toggleFolder = (folder) => {
    const next = new Set(activeFolders);
    next.has(folder) ? next.delete(folder) : next.add(folder);
    setActiveFolders(next);
  };

  const loadPost = async (path) => {
    const raw = await allPostFiles[path]();
    const html = marked.parse(raw);
    setPostContent(html);
    setActiveFolders(new Set());
  };

  return (
    <div className="container">
      <div className="header">
        <button
          className="avatar-button"
          onClick={() =>
            window.open("https://github.com/MTPruett-DevOps/help", "_blank", "noopener,noreferrer")
          }
          aria-label="GitHub"
        >
          <img
            src="https://github.com/pruettmt.png"
            alt="MT Pruett"
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

      {!docsMode && !aboutCollapsed && <About onSkip={transitionToDocs} />}

      {docsMode && (
        <div className={`content-wrapper ${fadingOut ? "fade-out-down" : "fade-in-down"}`}>
          <div className="main-buttons">
            <div className="about-button-wrapper">
              <button className="nav-button" onClick={returnToAbout}>About</button>
            </div>

            {Object.keys(folderToPosts).map((folder) => (
              <div key={folder} className="folder-block">
                <button className="nav-button" onClick={() => toggleFolder(folder)}>
                  {folder.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              </div>
            ))}
          </div>

          {[...activeFolders].map(folder => (
            <div key={folder} className="sub-buttons-line">
              {folderToPosts[folder].map((path) => (
                <button
                  key={path}
                  className="nav-button sub-post-button"
                  onClick={() => loadPost(path)}
                >
                  {formatPostTitle(path)}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {postContent && (
        <div className="markdown fade-in-up" dangerouslySetInnerHTML={{ __html: postContent }} />
      )}
    </div>
  );
}
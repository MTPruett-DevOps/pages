import React, { useState, useEffect } from "react";
import "./App.css";
import { marked } from "marked";
import About from "./about";

const allPostFiles = import.meta.glob("./posts/**/*.md", {
  query: "?raw",
  import: "default",
});

const folderToPosts = {};
Object.keys(allPostFiles).forEach((path) => {
  const parts = path.split("/");
  const folder = parts[2];
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
  const [openFolders, setOpenFolders] = useState([]);
  const [closingFolders, setClosingFolders] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [activePostPath, setActivePostPath] = useState("");
  const [postVisible, setPostVisible] = useState(false);

  const transitionToDocs = (e) => {
    e.preventDefault();
    setAboutCollapsed(true);
    setTimeout(() => setDocsMode(true), 800);
  };

  const returnToAbout = () => {
    setFadingOut(true);
    setTimeout(() => {
      setPostContent("");
      setActivePostPath("");
      setPostVisible(false);
      setOpenFolders([]);
      setClosingFolders([]);
      setDocsMode(false);
      setAboutCollapsed(false);
      setFadingOut(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  const toggleFolder = (folder) => {
    const isOpen = openFolders.includes(folder);
    if (isOpen) {
      setClosingFolders((prev) => [...prev, folder]);
      setTimeout(() => {
        setOpenFolders((prev) => prev.filter((f) => f !== folder));
        setClosingFolders((prev) => prev.filter((f) => f !== folder));
      }, 800);
    } else {
      setOpenFolders((prev) => [...prev, folder]);
    }
  };

  const loadPost = async (path) => {
    if (path === activePostPath) return;
    const raw = await allPostFiles[path]();
    const html = marked.parse(raw);
    setActivePostPath(path);
    setPostContent(html);
    setPostVisible(false);
    setTimeout(() => setPostVisible(true), 0);
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

      {!docsMode && (
        <div className={`about-wrapper ${aboutCollapsed ? "fade-out-down" : "fade-in-down"}`}>
          <About onSkip={transitionToDocs} />
        </div>
      )}

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

          {Object.keys(folderToPosts).map((folder) => {
            const isOpen = openFolders.includes(folder);
            const isClosing = closingFolders.includes(folder);
            if (!isOpen && !isClosing) return null;

            return (
              <div
                key={folder}
                className={`sub-buttons-line-wrapper ${
                  isClosing ? "fade-out" : "fade-in-only"
                }`}
              >
                <div className="sub-buttons-line">
                  {folderToPosts[folder].map((path) => (
                    <button
                      key={path}
                      className={`nav-button sub-post-button ${
                        activePostPath === path ? "active-post-button" : ""
                      }`}
                      onClick={() => loadPost(path)}
                    >
                      {formatPostTitle(path)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div className={`post-wrapper ${postVisible ? "fade-in-down" : ""}`}>
            {postContent && (
              <div
                className="markdown"
                dangerouslySetInnerHTML={{ __html: postContent }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { marked } from "marked";
import parse from "html-react-parser";
import "./App.css";
import About from "./about";

// Mermaid config
marked.setOptions({ gfm: true, breaks: true });

marked.use({
  extensions: [
    {
      name: "mermaid",
      level: "block",
      start(src) {
        return src.match(/```mermaid/)?.index;
      },
      tokenizer(src) {
        const match = /^```mermaid\n([\s\S]+?)```/.exec(src);
        if (match) {
          return {
            type: "mermaid",
            raw: match[0],
            text: match[1].trim(),
            tokens: [],
          };
        }
      },
      renderer(token) {
        const themeBlock = `%%{init: {
  "theme": "default",
  "themeVariables": {
    "fontFamily": "courier",
    "textColor": "#000",
    "primaryTextColor": "#000",
    "nodeTextColor": "#000"
  }
}}%%`;
        return `<div class="mermaid">${themeBlock}\n${token.text}</div>`;
      },
    },
  ],
});

// Load markdown posts
const allPostFiles = import.meta.glob("./posts/**/*.md", {
  query: "?raw",
  import: "default",
});

const folderToPosts = {};
Object.keys(allPostFiles).forEach((path) => {
  const parts = path.split("/");
  const folder = parts.slice(2, -1).join("/");
  if (!folderToPosts[folder]) folderToPosts[folder] = [];
  folderToPosts[folder].push(path);
});

function formatPostTitle(path) {
  return path.split("/").pop().replace(/\.md$/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFolderTitle(folder) {
  return folder
    .split("/")
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");
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
    setActivePostPath("");
    setPostContent("");
    setAboutCollapsed(true);
    setTimeout(() => {
      setDocsMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
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
    }, 100);
  };

  const toggleFolder = (folder) => {
    const isOpen = openFolders.includes(folder);
    if (isOpen) {
      setClosingFolders((prev) => [...prev, folder]);
      setTimeout(() => {
        setOpenFolders((prev) => prev.filter((f) => f !== folder));
        setClosingFolders((prev) => prev.filter((f) => f !== folder));
      }, 100);
    } else {
      setOpenFolders((prev) => [...prev, folder]);
    }
  };

  const loadPost = async (path) => {
    console.log("🟡 Trying to load post:", path);
    try {
      const loader = allPostFiles[path];
      if (!loader) {
        console.error("❌ Could not find loader for path:", path);
        return;
      }

      const raw = await loader();
      console.log("📄 Raw markdown loaded:", raw.slice(0, 100));

      const html = marked.parse(raw);
      console.log("✅ Markdown parsed");

      setActivePostPath(path);
      setPostContent(html);
      setPostVisible(true);

      // 💣 Inject fix after rendering Mermaid
      setTimeout(() => {
        try {
          mermaid.initialize({ startOnLoad: false });
          mermaid.init(undefined, ".mermaid");

          requestAnimationFrame(() => {
            const svgs = document.querySelectorAll(".mermaid svg");
            svgs.forEach((svg) => {
              const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
              style.textContent = `
                text,
                .label,
                foreignObject div,
                foreignObject span {
                  fill: #000 !important;
                  color: #000 !important;
                  font-weight: 600 !important;
                }
              `;
              svg.insertBefore(style, svg.firstChild);
            });

            console.log("✅ Mermaid injected with inline SVG styles");
          });
        } catch (err) {
          console.error("❌ Mermaid render error:", err);
        }
      }, 100);
    } catch (err) {
      console.error("❌ loadPost failed:", err);
    }
  };

  useEffect(() => {
    const all = Object.values(folderToPosts).flat();
    if (all.length > 0) loadPost(all[0]);
  }, []);

  return (
    <div className="container">
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

      {!docsMode && (
        <div className={`about-wrapper ${aboutCollapsed ? "fade-out-down" : "fade-in-down"}`}>
          <About onSkip={transitionToDocs} />
        </div>
      )}

      {docsMode && (
        <div className={`content-wrapper ${fadingOut ? "fade-out-down" : "fade-in-down visible"}`}>
          <div className="main-buttons">
            <div className="about-button-wrapper">
              <button className="nav-button" onClick={returnToAbout}>About</button>
            </div>

            {Object.keys(folderToPosts).map((folder) => (
              <div key={folder} className="folder-block">
                <button className="nav-button" onClick={() => toggleFolder(folder)}>
                  {formatFolderTitle(folder)}
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
                className={`sub-buttons-line-wrapper ${isClosing ? "fade-out" : "fade-in-only"}`}
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
            {postContent && <div className="markdown">{parse(postContent)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { marked } from "marked";
import parse from "html-react-parser";
import "./App.css";
import About from "./about";
import Buttons from "./buttons";
import Header from "./header"; // ✅ New import

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

export default function App() {
  const [docsMode, setDocsMode] = useState(() => {
    return localStorage.getItem('lastOpenedPost') ? true : false;
  });
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
    localStorage.removeItem('lastOpenedPost');
    setDocsMode(false);
    setPostContent("");
    setPostVisible(false);
    setActivePostPath("");
    setOpenFolders([]);
    setAboutCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    try {
      const loader = allPostFiles[path];
      if (!loader) return;

      const raw = await loader();
      const html = marked.parse(raw);
      setActivePostPath(path);
      setPostContent(html);
      localStorage.setItem('lastOpenedPost', path);

      const parts = path.split("/");
      const folder = parts.slice(2, -1).join("/");
      setOpenFolders([folder]);

      setPostVisible(true);

      setTimeout(() => {
        mermaid.initialize({ startOnLoad: false });
        mermaid.init(undefined, ".mermaid");
      }, 100);
    } catch (err) {
      console.error("Failed to load post:", err);
    }
  };

  useEffect(() => {
    const lastPost = localStorage.getItem('lastOpenedPost');
    const allPosts = Object.values(folderToPosts).flat();

    if (lastPost && allPosts.includes(lastPost)) {
      loadPost(lastPost);
    } else if (allPosts.length > 0) {
      loadPost(allPosts[0]);
    }
  }, []);

  return (
    <div className="container">
      <Header />
      <Buttons
        docsMode={docsMode}
        aboutCollapsed={aboutCollapsed}
        returnToAbout={returnToAbout}
        transitionToDocs={transitionToDocs}
        openFolders={openFolders}
        toggleFolder={toggleFolder}
        folderToPosts={folderToPosts}
        activePostPath={activePostPath}
        loadPost={loadPost}
      />

      {!docsMode && (
        <div className={`about-wrapper ${aboutCollapsed ? "fade-out-down" : "fade-in-down"}`}>
          <About onSkip={transitionToDocs} />
        </div>
      )}

      {docsMode && (
        <div className={`content-wrapper ${fadingOut ? "fade-out-down" : "fade-in-down visible"}`}>
          <div className={`post-wrapper ${postVisible ? "fade-in-down" : ""}`}>
            {postContent && <div className="markdown">{parse(postContent)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
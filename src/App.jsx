import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { marked } from "marked";
import parse from "html-react-parser";
import "./App.css";

import About from "./about";
import Buttons from "./buttons";
import Header from "./header";
import MarkDownRenderer from "./MarkDownRenderer";

marked.setOptions({ gfm: true, breaks: true });

// Mermaid integration
marked.use({
  extensions: [{
    name: "mermaid",
    level: "block",
    start(src) {
      return src.match(/```mermaid/)?.index;
    },
    tokenizer(src) {
      const match = /^```mermaid\n([\s\S]+?)```/.exec(src);
      if (match) {
        return { type: "mermaid", raw: match[0], text: match[1].trim(), tokens: [] };
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
  }]
});

// Load markdown files
const allPostFiles = import.meta.glob("./posts/**/*.md", { query: "?raw", import: "default" });

const folderToPosts = {};
Object.keys(allPostFiles).forEach((path) => {
  const parts = path.split("/");
  const folder = parts.slice(2, -1).join("/");
  folderToPosts[folder] ||= [];
  folderToPosts[folder].push(path);
});

export default function App() {
  const [docsMode, setDocsMode] = useState(false);
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [openFolders, setOpenFolders] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [activePostPath, setActivePostPath] = useState("");
  const [postVisible, setPostVisible] = useState(false);

  const transitionToDocs = (e) => {
    e?.preventDefault();
    resetView();
    setAboutCollapsed(true);
    setTimeout(() => {
      setDocsMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const returnToAbout = () => {
    setTimeout(() => {
      resetView();
      setDocsMode(false);
      setAboutCollapsed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const resetView = () => {
    setActivePostPath("");
    setPostContent("");
    setOpenFolders([]);
    setPostVisible(false);
  };

  const toggleFolder = (folder) => {
    setOpenFolders((prev) => prev.includes(folder) ? [] : [folder]);
  };

  const loadPost = async (path) => {
    try {
      const loader = allPostFiles[path];
      if (!loader) return;
      const raw = await loader();
      const html = marked.parse(raw);
      setActivePostPath(path);
      setPostContent(html);
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
    const all = Object.values(folderToPosts).flat();
    if (all.length > 0) loadPost(all[0]);
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
          <About />
        </div>
      )}

      {docsMode && (
        <div className="content-wrapper fade-in-down visible">
          <MarkDownRenderer postContent={postContent} postVisible={postVisible} />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import "./App.css";
import About from "./about";
import Buttons from "./buttons";
import Header from "./header";
import MarkdownRenderer from "./MarkDownRenderer";

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

export default function App() {
  const [docsMode, setDocsMode] = useState(() => {
    return sessionStorage.getItem("lastOpenedPost") ? true : false;
  });
  const [aboutCollapsed, setAboutCollapsed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [openFolders, setOpenFolders] = useState([]);
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
    sessionStorage.removeItem("lastOpenedPost");
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
      setActivePostPath(path);
      setPostContent(raw);
      sessionStorage.setItem("lastOpenedPost", path);

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
    const lastPost = sessionStorage.getItem("lastOpenedPost");
    const allPosts = Object.values(folderToPosts).flat();

    if (lastPost && allPosts.includes(lastPost)) {
      loadPost(lastPost);
    } else {
      setDocsMode(false);
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
            {postContent && <MarkdownRenderer content={postContent} />}
          </div>
        </div>
      )}
    </div>
  );
}
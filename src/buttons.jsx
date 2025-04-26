import "./buttons.css"; // ✅ NEW import
import React from "react";

function formatPostTitle(path) {
  return path.split("/").pop().replace(/\.md$/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFolderTitle(folder) {
  return folder
    .split("/")
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");
}

export default function Buttons({
  docsMode,
  returnToAbout,
  transitionToDocs,
  openFolders,
  toggleFolder,
  folderToPosts,
  activePostPath,
  loadPost,
}) {
  const anyFolderOpen = openFolders.length > 0;
  const openFolder = openFolders[0];

  if (!docsMode) {
    return (
      <div className="doc-button-wrapper">
        <button className="nav-button" onClick={transitionToDocs}>
          Documentation
        </button>
      </div>
    );
  }

  return (
    <div className="main-buttons">
      {!anyFolderOpen && (
        <>
          <div className="about-button-wrapper">
            <button className="nav-button" onClick={returnToAbout}>
              About
            </button>
          </div>

          {Object.keys(folderToPosts).map((folder) => (
            <div key={folder} className="folder-block">
              <button className="nav-button" onClick={() => toggleFolder(folder)}>
                {formatFolderTitle(folder)}
              </button>
            </div>
          ))}
        </>
      )}

      {anyFolderOpen && (
        <div className="folder-with-posts-block">
          <button className="nav-button" onClick={() => toggleFolder(openFolder)}>
            {formatFolderTitle(openFolder)}
          </button>

          <div className="sub-buttons-line-wrapper fade-in-only">
            <div className="sub-buttons-line">
              {folderToPosts[openFolder].map((path) => (
                <button
                  key={path}
                  className={`nav-button sub-post-button ${activePostPath === path ? "active-post-button" : ""}`}
                  onClick={() => loadPost(path)}
                >
                  {formatPostTitle(path)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";

// Glob all .md files under each section
const setups = import.meta.glob("../posts/setups/*.md", { eager: true });
const architecture = import.meta.glob("../posts/architecture/*.md", { eager: true });
const misc = import.meta.glob("../posts/misc/*.md", { eager: true });

const sections = {
  setups: {
    name: "Setups",
    posts: setups,
  },
  architecture: {
    name: "Architecture Decisions",
    posts: architecture,
  },
  posts: {
    name: "Posts",
    posts: misc,
  },
};

function normalizeName(path) {
  return path
    .split("/").pop()
    .replace(".md", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState(null);
  const [activePost, setActivePost] = useState(null);

  const currentPosts = activeSection ? sections[activeSection].posts : null;

  return (
    <div>
      <h2>Docs</h2>

      {/* Section buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {Object.entries(sections).map(([key, { name }]) => (
          <button key={key} onClick={() => {
            setActiveSection(key);
            setActivePost(null);
          }}>
            {name}
          </button>
        ))}
      </div>

      {/* Post list */}
      {currentPosts && (
        <ul>
          {Object.entries(currentPosts).map(([path, mod]) => (
            <li key={path}>
              <button onClick={() => setActivePost(path)}>
                {normalizeName(path)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Render selected post */}
      {activePost && (
        <div style={{ marginTop: "2rem" }}>
          {sections[activeSection].posts[activePost].default()}
        </div>
      )}
    </div>
  );
}
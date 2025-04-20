import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false });

export default function MermaidChart({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.render("mermaid-" + Math.random().toString(36).substr(2, 9), chart)
        .then(({ svg }) => {
          ref.current.innerHTML = svg;
        })
        .catch(console.error);
    }
  }, [chart]);

  return <div ref={ref} />;
}
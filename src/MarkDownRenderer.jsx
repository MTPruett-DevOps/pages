import ReactMarkdown from "react-markdown";
import MermaidChart from "./mermaid";

function CodeBlock({ className, children }) {
  const isMermaid = className === "language-mermaid";
  if (isMermaid) {
    return <MermaidChart chart={String(children).trim()} />;
  }

  return (
    <pre className={className}>
      <code>{children}</code>
    </pre>
  );
}

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
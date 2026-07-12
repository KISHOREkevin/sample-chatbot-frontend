"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

export default function MarkdownRenderer({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || "");

          // Fenced code block (```js)
          if (match) {
            return (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, "")}
              />
            );
          }

          // Inline code (`code`)
          return (
            <code className="rounded bg-zinc-800 px-1 py-0.5 text-pink-400">
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
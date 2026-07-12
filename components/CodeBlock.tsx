"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
    language: string;
    value: string;
}

export default function CodeBlock({ language, value }: Props) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(value);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">

                <span className="text-xs text-zinc-400 uppercase">
                    {language || "TEXT"}
                </span>

                <button
                    onClick={copy}
                    className="rounded px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 transition"
                >
                    {copied ? "Copied ✓" : "Copy"}
                </button>
            </div>

            {/* Code */}
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                PreTag={(props) => (
                    <pre
                        {...props}
                        className="m-0 p-0"
                    />
                )}
                customStyle={{
                    margin: 0,
                    padding: "20px",
                    background: "transparent",
                    overflowX: "auto",
                }}
                codeTagProps={{
                    style: {
                        padding: 0,
                        margin: 0,
                    },
                }}

            >
                {value}
            </SyntaxHighlighter>

        </div>
    );
}
"use client";

import React, { useState } from 'react';

// Custom component to handle code blocks with copy-to-clipboard functionality
export const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-white/10 bg-[#030712] font-mono text-sm">
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 text-xs text-zinc-400 border-b border-white/5">
        <span className="uppercase font-semibold tracking-wider text-indigo-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors duration-150 py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-300">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

// Custom component to handle text blocks with inline styling and structures
export const TextBlock = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 my-2 space-y-1.5 text-zinc-300">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-slate-950/40">
          <table className="min-w-full divide-y divide-white/10 text-sm text-zinc-300">
            {tableHeaders.length > 0 && (
              <thead className="bg-white/5 text-white">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left font-semibold border-r border-white/5 last:border-0" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(header) }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-white/5">
              {tableRows.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2.5 border-r border-white/5 last:border-0" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Markdown Images
    if (trimmed.startsWith('![') && trimmed.endsWith(')')) {
      flushList(lineIdx);
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const src = match[2];
        elements.push(
          <div key={lineIdx} className="my-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 max-w-md">
            <img src={src} alt={alt} className="w-full h-auto max-h-[250px] object-cover transition-transform duration-300 hover:scale-105" />
            <div className="p-2.5 text-xs text-zinc-500 text-center border-t border-white/5 bg-slate-950/60 font-medium">
              📷 {alt}
            </div>
          </div>
        );
        return;
      }
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(lineIdx);
      inTable = true;
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => c.match(/^:?-+:?$/))) {
        return;
      }
      if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else {
      flushTable(lineIdx);
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      return;
    } else if (trimmed.match(/^\d+\.\s/)) {
      flushList(lineIdx);
      elements.push(
        <p key={lineIdx} className="my-2 text-zinc-300 pl-4" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
      );
      return;
    } else {
      flushList(lineIdx);
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={lineIdx} className="text-lg font-semibold text-white mt-5 mb-2" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.slice(4)) }} />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={lineIdx} className="text-xl font-bold text-white mt-6 mb-3" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.slice(3)) }} />);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={lineIdx} className="text-2xl font-extrabold text-white mt-8 mb-4" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.slice(2)) }} />);
    } else if (trimmed === '') {
      elements.push(<div key={lineIdx} className="h-2" />);
    } else {
      elements.push(<p key={lineIdx} className="my-1.5 leading-relaxed text-zinc-300" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />);
    }
  });

  flushList(lines.length);
  flushTable(lines.length);

  return <>{elements}</>;
};

// Inlining parsing for simple bolding and code highlights
export const formatInlineMarkdown = (text: string) => {
  let html = text;
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-rose-400 font-mono text-xs">$1</code>');
  return html;
};

// Main exporter to parse nested markdown blocks
export const parseMarkdown = (text: string): React.ReactNode[] => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <CodeBlock key={index} language={lang} code={code} />
      );
    } else {
      return <TextBlock key={index} text={part} />;
    }
  });
};

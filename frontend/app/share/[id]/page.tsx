"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ShareData {
  repo_url: string;
  owner: string;
  repo: string;
  explanation: string;
  stars: number;
  language: string;
  view_count: number;
  created_at: string;
}

export default function SharePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`${API_URL}/api/share/${params.id}`);
        if (!res.ok) throw new Error("Share not found");
        const json = await res.json();
        setData(json);
      } catch {
        setError("This share link doesn't exist or has expired.");
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [params.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#080c10] text-[#e6edf3] font-mono">
      <div
        className="fixed inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#1a2535 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#1e2a38] bg-[#080c10]/90 backdrop-blur px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[#8b949e] hover:text-[#3fb950] transition-colors text-xs"
        >
          ← back to reposage
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-[#3fb950] text-[#080c10] text-xs font-bold px-2 py-1 rounded">RS</span>
          <span className="text-sm font-bold tracking-tight">
            repo<span className="text-[#3fb950]">sage</span>
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-[#8b949e] hover:text-[#3fb950] transition-colors border border-[#1e2a38] px-3 py-1 rounded"
        >
          {copied ? "✓ copied!" : "copy link"}
        </button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 text-[#3fb950] text-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            loading shared explanation...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#2d1a1a] border border-[#6a2020] rounded-lg p-6">
            <div className="text-[#f85149] text-xs font-bold mb-2">not found</div>
            <div className="text-[#8b949e] text-sm">{error}</div>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-xs text-[#3fb950] border border-[#238636] px-3 py-1 rounded hover:bg-[#1a3a20] transition-colors"
            >
              ← explain a repo
            </button>
          </div>
        )}

        {/* Content */}
        {data && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              <span className="text-[#3fb950] text-xs">shared explanation</span>
              <code className="text-[#e6edf3] text-xs bg-[#111820] border border-[#1e2a38] px-3 py-1 rounded">
                github.com/{data.owner}/{data.repo}
              </code>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mb-6 flex-wrap">
              {data.stars > 0 && (
                <span className="text-xs text-[#495869] border border-[#1e2a38] px-3 py-1 rounded">
                  ⭐ {data.stars.toLocaleString()} stars
                </span>
              )}
              {data.language && (
                <span className="text-xs text-[#495869] border border-[#1e2a38] px-3 py-1 rounded">
                  {data.language}
                </span>
              )}
              <span className="text-xs text-[#495869] border border-[#1e2a38] px-3 py-1 rounded">
                👁 {data.view_count} views
              </span>
              <span className="text-xs text-[#495869] border border-[#1e2a38] px-3 py-1 rounded">
                {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Explanation */}
            <div className="bg-[#0d1117] border border-[#1e2a38] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111820] border-b border-[#1e2a38]">
                <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                <div className="w-3 h-3 rounded-full bg-[#e3b341]" />
                <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
                <span className="text-[#495869] text-xs ml-2">reposage — output</span>
                <span className="text-[#3fb950] text-xs ml-auto">✓ complete</span>
              </div>
              <div className="p-6">
                <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                  {data.explanation}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={() => router.push("/")}
                className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors"
              >
                ← explain another repo
              </button>
              <button
                onClick={handleCopy}
                className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors"
              >
                {copied ? "✓ copied!" : "copy share link"}
              </button>
              <a
                href={`https://github.com/${data.owner}/${data.repo}`}
                target="_blank"
                className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors"
              >
                view on github ↗
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
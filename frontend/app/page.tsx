"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "vercel/next.js",
  "tiangolo/fastapi",
  "django/django",
  "torvalds/linux",
  "rust-lang/rust",
];

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setError("");
    setLoading(true);
    const encoded = encodeURIComponent(repoUrl.trim());
    router.push(`/explain?repo=${encoded}`);
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

      <nav className="relative z-10 border-b border-[#1e2a38] bg-[#080c10]/90 backdrop-blur px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#3fb950] text-[#080c10] text-xs font-bold px-2 py-1 rounded">RS</span>
          <span className="text-sm font-bold tracking-tight">repo<span className="text-[#3fb950]">sage</span></span>
        </div>
        <a href="https://github.com/Dantechdevs/reposage" target="_blank"
          className="text-xs text-[#8b949e] hover:text-[#3fb950] transition-colors border border-[#1e2a38] px-3 py-1 rounded">
          ⭐ Star on GitHub
        </a>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 text-center">

        <div className="flex items-center gap-2 text-[#3fb950] text-xs border border-[#238636] bg-[#1a3a20] px-3 py-1 rounded mb-8">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          v0.1.0 — open source
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
          Understand any<br />
          repo <span className="text-[#3fb950] italic font-light">instantly.</span>
        </h1>

        <p className="text-[#8b949e] text-lg max-w-xl mb-10 leading-relaxed">
          Paste a GitHub URL and get a full breakdown — architecture, key files, dependencies, and a contribution guide.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-4">
          <div className={`flex bg-[#111820] border rounded-lg overflow-hidden transition-colors ${
            error ? "border-[#f85149]" : "border-[#1e2a38] focus-within:border-[#238636]"
          }`}>
            <span className="px-4 py-3 text-[#495869] text-sm border-r border-[#1e2a38] whitespace-nowrap">
              github.com/
            </span>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="owner/repository"
              className="flex-1 bg-transparent outline-none text-sm px-3 py-3 text-[#e6edf3] placeholder-[#495869] caret-[#3fb950]"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-[#3fb950] text-xs font-bold px-5 py-3 transition-colors whitespace-nowrap"
            >
              {loading ? "loading..." : "explain →"}
            </button>
          </div>
          {error && <p className="text-[#f85149] text-xs mt-2 text-left">{error}</p>}
        </form>

        <div className="flex flex-wrap gap-2 justify-center mb-16">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setRepoUrl(ex)}
              className="text-xs text-[#495869] border border-[#1e2a38] bg-[#111820] hover:border-[#238636] hover:text-[#3fb950] px-3 py-1 rounded transition-colors">
              {ex}
            </button>
          ))}
        </div>

        <div className="flex gap-8 text-center">
          {[
            { n: "~30s", l: "analysis time" },
            { n: "6", l: "signals extracted" },
            { n: "100%", l: "open source" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl font-bold text-[#3fb950]">{s.n}</div>
              <div className="text-xs text-[#495869] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
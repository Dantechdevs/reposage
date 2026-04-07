"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { streamExplainRepo } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function ExplainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoUrl = searchParams.get("repo") || "";

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState("");
  const [sharing, setSharing] = useState(false);

  const displayRepo = decodeURIComponent(repoUrl)
    .replace("https://github.com/", "")
    .replace("github.com/", "");

  const [owner, repo] = displayRepo.split("/");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (!repoUrl) { router.push("/"); return; }
    setOutput(""); setLoading(true); setError(""); setDone(false); setShareId("");

    streamExplainRepo(
      repoUrl,
      (chunk) => { setLoading(false); setOutput((prev) => prev + chunk); },
      () => { setLoading(false); setDone(true); },
      (err) => { setLoading(false); setError(err); }
    );
  }, [repoUrl]);

  const handleShare = async () => {
    if (!output || sharing) return;
    setSharing(true);
    try {
      const res = await fetch(`${API_URL}/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: decodeURIComponent(repoUrl),
          explanation: output,
          owner: owner || "",
          repo: repo || "",
        }),
      });
      const data = await res.json();
      setShareId(data.share_id);
    } catch {
      setError("Failed to create share link");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShare = () => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#080c10] text-[#e6edf3] font-mono">
      <div className="fixed inset-0 opacity-40"
        style={{ backgroundImage: "radial-gradient(#1a2535 1px,transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#1e2a38] bg-[#080c10]/90 backdrop-blur px-6 h-14 flex items-center justify-between">
        <button onClick={() => router.push("/")}
          className="text-xs text-[#8b949e] hover:text-[#3fb950] transition-colors">
          ← back
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-[#3fb950] text-[#080c10] text-xs font-bold px-2 py-1 rounded">RS</span>
          <span className="text-sm font-bold tracking-tight">repo<span className="text-[#3fb950]">sage</span></span>
        </div>
        <a href={`https://github.com/${displayRepo}`} target="_blank"
          className="text-xs text-[#8b949e] hover:text-[#3fb950] transition-colors">
          {displayRepo} ↗
        </a>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* Repo header */}
        <div className="flex items-center gap-3 mb-8">
          <span className={`w-2 h-2 rounded-full ${done ? "bg-[#3fb950]" : "bg-[#3fb950] animate-pulse"}`} />
          <span className="text-[#3fb950] text-xs">{done ? "analysis complete" : "analyzing"}</span>
          <code className="text-[#e6edf3] text-xs bg-[#111820] border border-[#1e2a38] px-3 py-1 rounded">
            github.com/{displayRepo}
          </code>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-[#0d1117] border border-[#1e2a38] rounded-lg p-8">
            <div className="text-[#3fb950] text-xs mb-4 animate-pulse">fetching repo context...</div>
            <div className="text-[#495869] text-xs space-y-2">
              <div>→ reading README and key files</div>
              <div>→ scanning file tree</div>
              <div>→ pulling recent commits</div>
              <div>→ generating breakdown</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#2d1a1a] border border-[#6a2020] rounded-lg p-6">
            <div className="text-[#f85149] text-xs font-bold mb-2">error</div>
            <div className="text-[#8b949e] text-sm">{error}</div>
            <button onClick={() => router.push("/")}
              className="mt-4 text-xs text-[#3fb950] border border-[#238636] px-3 py-1 rounded hover:bg-[#1a3a20] transition-colors">
              ← try another repo
            </button>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="bg-[#0d1117] border border-[#1e2a38] rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111820] border-b border-[#1e2a38]">
              <div className="w-3 h-3 rounded-full bg-[#f85149]" />
              <div className="w-3 h-3 rounded-full bg-[#e3b341]" />
              <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
              <span className="text-[#495869] text-xs ml-2">reposage — output</span>
              <span className="text-[#495869] text-xs ml-auto">
                {done ? "✓ done" : "● streaming..."}
              </span>
            </div>
            <div className="p-6">
              <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                {output}
                {!done && (
                  <span className="inline-block w-2 h-4 bg-[#3fb950] ml-1 animate-pulse align-middle" />
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        {done && (
          <div className="flex gap-3 mt-6 flex-wrap">
            <button onClick={() => router.push("/")}
              className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors">
              ← explain another
            </button>
            <button onClick={handleCopyOutput}
              className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors">
              {copied ? "✓ copied!" : "copy output"}
            </button>
            {!shareId ? (
              <button onClick={handleShare} disabled={sharing}
                className="text-xs text-[#3fb950] border border-[#238636] bg-[#1a3a20] px-4 py-2 rounded hover:bg-[#238636] transition-colors disabled:opacity-50">
                {sharing ? "creating link..." : "🔗 create share link"}
              </button>
            ) : (
              <button onClick={handleCopyShare}
                className="text-xs text-[#3fb950] border border-[#238636] bg-[#1a3a20] px-4 py-2 rounded hover:bg-[#238636] transition-colors">
                {copied ? "✓ copied!" : `🔗 /share/${shareId}`}
              </button>
            )}
            <a href={`https://github.com/${displayRepo}`} target="_blank"
              className="text-xs text-[#8b949e] border border-[#1e2a38] px-4 py-2 rounded hover:border-[#238636] hover:text-[#3fb950] transition-colors">
              view on github ↗
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080c10] flex items-center justify-center">
        <span className="text-[#3fb950] font-mono text-sm animate-pulse">loading...</span>
      </div>
    }>
      <ExplainContent />
    </Suspense>
  );
}
import httpx
import os
import base64
from typing import Optional


GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API   = "https://api.github.com"

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def parse_repo_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    if url.startswith("https://github.com/"):
        url = url.replace("https://github.com/", "")
    if url.startswith("github.com/"):
        url = url.replace("github.com/", "")
    parts = url.split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL or repo: {url}")
    return parts[0], parts[1]


async def fetch_file_content(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
    path: str,
) -> Optional[str]:
    try:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
            headers=HEADERS,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("encoding") == "base64":
                return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
    except Exception:
        pass
    return None


async def fetch_repo_context(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:

        # 1. Repo metadata
        meta_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=HEADERS,
        )
        meta_resp.raise_for_status()
        meta = meta_resp.json()

        # 2. Languages
        lang_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/languages",
            headers=HEADERS,
        )
        languages = lang_resp.json() if lang_resp.status_code == 200 else {}

        # 3. File tree
        tree_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/HEAD",
            headers=HEADERS,
            params={"recursive": "1"},
        )
        tree = []
        if tree_resp.status_code == 200:
            tree = [
                item["path"]
                for item in tree_resp.json().get("tree", [])
                if item["type"] == "blob"
            ][:200]

        # 4. Key files
        key_files = [
            "README.md", "README.rst", "pyproject.toml",
            "package.json", "Makefile", "Dockerfile",
            "docker-compose.yml", ".env.example",
        ]
        file_contents = {}
        for f in key_files:
            content = await fetch_file_content(client, owner, repo, f)
            if content:
                file_contents[f] = content[:3000]

        # 5. Recent commits
        commits_resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/commits",
            headers=HEADERS,
            params={"per_page": 10},
        )
        commits = []
        if commits_resp.status_code == 200:
            for c in commits_resp.json():
                commits.append({
                    "message": c["commit"]["message"].split("\n")[0],
                    "author":  c["commit"]["author"]["name"],
                    "date":    c["commit"]["author"]["date"][:10],
                })

    return {
        "owner":          owner,
        "repo":           repo,
        "full_name":      meta.get("full_name", f"{owner}/{repo}"),
        "description":    meta.get("description", ""),
        "stars":          meta.get("stargazers_count", 0),
        "forks":          meta.get("forks_count", 0),
        "open_issues":    meta.get("open_issues_count", 0),
        "license":        meta.get("license", {}).get("spdx_id") if meta.get("license") else "None",
        "default_branch": meta.get("default_branch", "main"),
        "languages":      languages,
        "file_tree":      tree,
        "file_contents":  file_contents,
        "recent_commits": commits,
        "url":            f"https://github.com/{owner}/{repo}",
    }
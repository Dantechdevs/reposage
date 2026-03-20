import anthropic
import os
from typing import AsyncGenerator
from services.github import fetch_repo_context

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def build_prompt(context: dict) -> str:
    languages = ", ".join(context["languages"].keys()) if context["languages"] else "Unknown"
    tree_sample = "\n".join(context["file_tree"][:50])
    commits = "\n".join(
        f"  - [{c['date']}] {c['message']} ({c['author']})"
        for c in context["recent_commits"]
    )
    files_section = ""
    for filename, content in context["file_contents"].items():
        files_section += f"\n### {filename}\n```\n{content[:1500]}\n```\n"

    return f"""You are RepoSage, an expert at analyzing GitHub repositories and explaining them clearly to developers.

Analyze this GitHub repository and provide a structured, developer-friendly breakdown.

## Repository Info
- Name: {context['full_name']}
- Description: {context['description']}
- Stars: {context['stars']} | Forks: {context['forks']} | Open Issues: {context['open_issues']}
- License: {context['license']}
- Primary Languages: {languages}
- URL: {context['url']}

## File Tree (sample)
{tree_sample}

## Key Files
{files_section}

## Recent Commits
{commits}

---

Provide a complete breakdown with these exact sections:

## Purpose
What this project does, who it's for, and why it exists. 2-3 sentences max.

## Architecture
How the codebase is structured. Key folders, their roles, and how data flows.

## Key Files
The 5-8 most important files. For each: filename, one sentence on what it does.

## Tech Stack
Every major framework, library, and tool. Group by: Frontend / Backend / Database / DevOps.

## Getting Started
Step-by-step setup instructions based on what you see in the repo.

## How to Contribute
Where to start, conventions to follow, areas that need help.

## Key Insights
2-3 interesting non-obvious things about this codebase a developer should know.

Be precise, technical, and concise. Write for experienced developers. No fluff."""


async def stream_explanation(repo_url: str) -> AsyncGenerator[str, None]:
    context = await fetch_repo_context(repo_url)
    prompt = build_prompt(context)

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        async for chunk in stream.text_stream:
            yield chunk


async def get_explanation(repo_url: str) -> str:
    context = await fetch_repo_context(repo_url)
    prompt = build_prompt(context)

    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
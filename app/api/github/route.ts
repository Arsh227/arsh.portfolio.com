import { NextResponse } from "next/server";

const GITHUB_USERNAME = "Arsh227";

const AI_KEYWORDS = [
  "ai",
  "ml",
  "machine-learning",
  "tensorflow",
  "pytorch",
  "neural",
  "deep-learning",
  "computer-vision",
  "nlp",
  "jarvis",
  "intelligence",
  "opencv",
  "scikit-learn",
  "artificial",
  "automation",
  "chatbot",
  "recommendation",
];

function computeYearsExperience(createdAt: string) {
  const accountCreated = new Date(createdAt);
  const now = new Date();
  const years = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 365));
  return Math.max(0, years);
}

export async function GET() {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: { Accept: "application/vnd.github+json" },
      // Let Next cache where possible; also add explicit caching headers below.
      next: { revalidate: 900 },
    }),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 900 },
    }),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 502 });
  }

  const userData = await userRes.json();
  const reposData = (await reposRes.json()) as Array<any>;

  const yearsExperience = computeYearsExperience(userData.created_at);
  const totalProjects = userData.public_repos as number;
  const aiProjects = reposData.filter((repo) => {
    const name = String(repo.name ?? "").toLowerCase();
    const description = String(repo.description ?? "").toLowerCase();
    return AI_KEYWORDS.some((keyword) => name.includes(keyword) || description.includes(keyword));
  }).length;

  const clientSatisfaction = 100;

  const topRepos = [...reposData]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
    }));

  return NextResponse.json(
    {
      userData: {
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      },
      stats: {
        yearsExperience,
        totalProjects,
        aiProjects,
        clientSatisfaction,
      },
      repos: topRepos,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=300",
      },
    },
  );
}


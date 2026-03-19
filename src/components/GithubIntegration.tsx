"use client";

import { useEffect } from "react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}

function animateCountersIn(root: ParentNode) {
  const counters = root.querySelectorAll<HTMLElement>("[data-counter]");

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-counter") ?? "0", 10);
    if (Number.isNaN(target)) return;

    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    counter.textContent = "0";

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = String(Math.floor(current));
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = String(target);
      }
    };

    updateCounter();
  });
}

export default function GithubIntegration() {
  useEffect(() => {
    let refreshTimer: number | undefined;
    let cancelled = false;

    const run = async () => {
      const reposContainer = document.getElementById("github-repos");
      if (!reposContainer || cancelled) return;

      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error("Failed to load GitHub payload");
        const payload = await res.json();

        const { userData, stats, repos } = payload as {
          userData: { public_repos: number; followers: number; following: number };
          stats: { yearsExperience: number; totalProjects: number; aiProjects: number; clientSatisfaction: number };
          repos: Array<any>;
        };

        const githubSection = document.getElementById("github");
        const experienceStats = document.querySelector<HTMLElement>(".experience-stats");

        // Update GitHub counters inside the GitHub section (avoids collisions with other counters).
        if (githubSection) {
          const setCounter = (placeholder: string, value: number) => {
            const el = githubSection.querySelector<HTMLElement>(`[data-counter="${placeholder}"]`);
            if (!el) return;
            el.setAttribute("data-counter", String(value));
          };

          setCounter("10", userData.public_repos);
          setCounter("1", userData.followers);
          setCounter("5", userData.following);
        }

        // Update experience counters (years/projects/AI/satisfaction).
        if (experienceStats) {
          const setCounter = (placeholder: string, value: number) => {
            const el = experienceStats.querySelector<HTMLElement>(`[data-counter="${placeholder}"]`);
            if (!el) return;
            el.setAttribute("data-counter", String(value));
          };

          setCounter("5", stats.yearsExperience);
          setCounter("50", stats.totalProjects);
          setCounter("15", stats.aiProjects);
          setCounter("100", stats.clientSatisfaction);
        }

        // Animate updated counters so it still feels premium.
        if (githubSection) animateCountersIn(githubSection);
        if (experienceStats) animateCountersIn(experienceStats);

        // Render repo cards.
        const topReposHtml = repos
          .map((repo) => {
            const languagesTag = repo.language ? `<span class="language-tag">${repo.language}</span>` : "";
            const description = repo.description ? `<p class="repo-description">${repo.description}</p>` : "";

            return `
              <div class="repo-card" data-reveal>
                <div class="repo-header">
                  <a href="${repo.html_url}" target="_blank" class="repo-name" rel="noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    ${repo.name}
                  </a>
                  <div class="repo-stats">
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                  </div>
                </div>
                ${description}
                <div class="repo-footer">
                  <div class="repo-languages">${languagesTag}</div>
                  <div class="repo-updated">Updated ${formatDate(repo.updated_at)}</div>
                </div>
              </div>
            `;
          })
          .join("");

        reposContainer.innerHTML = topReposHtml;

        // Force reveal for dynamically inserted cards.
        window.setTimeout(() => {
          reposContainer.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("revealed"));
        }, 100);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        reposContainer.innerHTML = `
          <div class="repo-card" data-reveal>
            <p style="text-align: center; color: var(--white_a70); padding: 40px;">
              Unable to load repositories. Please check your internet connection or try again later.
            </p>
          </div>
        `;
        window.setTimeout(() => {
          reposContainer.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add("revealed"));
        }, 100);
      }
    };

    // Start shortly after mount so the template HTML is present.
    window.setTimeout(() => {
      void run();
      refreshTimer = window.setInterval(() => {
        void run();
      }, 5 * 60 * 1000);
    }, 800);

    return () => {
      cancelled = true;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, []);

  return null;
}


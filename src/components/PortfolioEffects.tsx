"use client";

import { useEffect } from "react";

function addEventOnElements(elements: NodeListOf<Element>, eventType: string, callback: (ev: Event) => void) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}

export default function PortfolioEffects() {
  useEffect(() => {
    const loadingElement = document.querySelector<HTMLElement>("[data-loading]");
    const header = document.querySelector<HTMLElement>("[data-header]");
    const cursor = document.querySelector<HTMLElement>("[data-cursor]");
    const backTopBtn = document.querySelector<HTMLElement>("[data-back-top-btn]");

    // ==========================
    // #LOADING
    // ==========================
    const onLoad = () => {
      if (loadingElement) loadingElement.classList.add("loaded");
      document.body.classList.remove("active");
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    // ==========================
    // #NAV TOGGLE
    // ==========================
    const navTogglers = document.querySelectorAll("[data-nav-toggler]");
    const navLinks = document.querySelectorAll("[data-nav-link]");
    const navbar = document.querySelector<HTMLElement>("[data-navbar]");
    const overlay = document.querySelector<HTMLElement>("[data-overlay]");

    const toggleNav = () => {
      if (!navbar || !overlay) return;
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.classList.toggle("active");
    };

    const closeNav = () => {
      if (!navbar || !overlay) return;
      navbar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("active");
    };

    addEventOnElements(navTogglers, "click", toggleNav);
    addEventOnElements(navLinks, "click", closeNav);

    // ==========================
    // #HEADER ACTIVE ON SCROLL
    // ==========================
    const activeElementOnScroll = () => {
      if (!header) return;
      if (window.scrollY > 50) header.classList.add("active");
      else header.classList.remove("active");
    };
    window.addEventListener("scroll", activeElementOnScroll);

    // ==========================
    // #LETTER EFFECT
    // ==========================
    const letterBoxes = document.querySelectorAll<HTMLElement>("[data-letter-effect]");

    let activeLetterBoxIndex = 0;
    let lastActiveLetterBoxIndex = 0;
    let totalLetterBoxDelay = 0;

    const setLetterEffect = () => {
      for (let i = 0; i < letterBoxes.length; i++) {
        let letterAnimationDelay = 0;
        const letters = letterBoxes[i].textContent?.trim() ?? "";
        letterBoxes[i].textContent = "";

        for (let j = 0; j < letters.length; j++) {
          const span = document.createElement("span");
          span.style.animationDelay = `${letterAnimationDelay}s`;

          if (i === activeLetterBoxIndex) span.classList.add("in");
          else span.classList.add("out");

          span.textContent = letters[j];
          if (letters[j] === " ") span.classList.add("space");
          letterBoxes[i].appendChild(span);

          if (j >= letters.length - 1) break;
          letterAnimationDelay += 0.05;
        }

        if (i === activeLetterBoxIndex) {
          totalLetterBoxDelay = Number(letterAnimationDelay.toFixed(2));
        }

        if (i === lastActiveLetterBoxIndex) letterBoxes[i].classList.add("active");
        else letterBoxes[i].classList.remove("active");
      }

      window.setTimeout(() => {
        lastActiveLetterBoxIndex = activeLetterBoxIndex;
        activeLetterBoxIndex >= letterBoxes.length - 1 ? (activeLetterBoxIndex = 0) : activeLetterBoxIndex++;
        setLetterEffect();
      }, totalLetterBoxDelay * 1000 + 3000);
    };

    // Next.js may hydrate after `load`, so start shortly after mount.
    if (letterBoxes.length > 0) {
      if (document.readyState === "complete") setLetterEffect();
      else window.addEventListener("load", setLetterEffect, { once: true });
    }

    // ==========================
    // #BACK TOP PROGRESS
    // ==========================
    const onBackTopScroll = () => {
      if (!backTopBtn) return;
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollEndPos = bodyHeight - windowHeight;
      const totalScrollPercent = scrollEndPos > 0 ? (window.scrollY / scrollEndPos) * 100 : 0;

      backTopBtn.textContent = `${totalScrollPercent.toFixed(0)}%`;
      if (totalScrollPercent > 5) backTopBtn.classList.add("show");
      else backTopBtn.classList.remove("show");
    };
    window.addEventListener("scroll", onBackTopScroll);

    // ==========================
    // #CUSTOM CURSOR
    // ==========================
    const anchorElements = document.querySelectorAll("a");
    const buttons = document.querySelectorAll("button");

    const mouseMoveHandler = (event: MouseEvent) => {
      if (!cursor) return;
      const { clientX, clientY } = event;
      window.setTimeout(() => {
        cursor.style.top = `${clientY}px`;
        cursor.style.left = `${clientX}px`;
      }, 100);
    };

    const hoverActive = (_ev: Event) => cursor?.classList.add("hovered");
    const hoverDeactive = (_ev: Event) => cursor?.classList.remove("hovered");

    document.body.addEventListener("mousemove", mouseMoveHandler);
    addEventOnElements(anchorElements, "mouseover", hoverActive);
    addEventOnElements(anchorElements, "mouseout", hoverDeactive);
    addEventOnElements(buttons, "mouseover", hoverActive);
    addEventOnElements(buttons, "mouseout", hoverDeactive);

    const mouseOutHandler = () => cursor?.classList.add("disabled");
    const mouseOverHandler = () => cursor?.classList.remove("disabled");
    document.body.addEventListener("mouseout", mouseOutHandler);
    document.body.addEventListener("mouseover", mouseOverHandler);

    // ==========================
    // #COUNTERS + SKILL BARS
    // ==========================
    const animateCounters = (root: ParentNode = document) => {
      const counters = root.querySelectorAll<HTMLElement>("[data-counter]");
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-counter") ?? "0", 10);
        if (Number.isNaN(target)) return;
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

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
    };

    const animateSkillBars = (root: ParentNode = document) => {
      const skillBars = root.querySelectorAll<HTMLElement>("[data-skill]");
      skillBars.forEach((bar) => {
        const skillLevel = bar.getAttribute("data-skill");
        const progressBar = bar.querySelector<HTMLElement>(".skill-progress");
        if (!progressBar || !skillLevel) return;
        progressBar.style.width = `${skillLevel}%`;
      });
    };

    // ==========================
    // #SCROLL REVEAL (IntersectionObserver)
    // ==========================
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const animatedRevealSet = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("revealed");
            if (!animatedRevealSet.has(el)) {
              animatedRevealSet.add(el);
              // Run counters/skill animation only within this element.
              if (el.querySelector("[data-counter]")) animateCounters(el);
              if (el.querySelector("[data-skill]")) animateSkillBars(el);
            }
          } else {
            el.classList.remove("revealed");
          }
        }
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.01 },
    );

    revealElements.forEach((el) => io.observe(el));

    // ==========================
    // #PROJECT CARD HOVER INTERACTION
    // ==========================
    const projectCards = document.querySelectorAll<HTMLElement>(".gallery-card, .portfolio-card");

    const onEnter = function (this: HTMLElement) {
      this.style.transform = "translateY(-10px)";
      this.style.transition = "transform 0.3s ease";
    };
    const onLeave = function (this: HTMLElement) {
      this.style.transform = "translateY(0)";
    };

    projectCards.forEach((card) => {
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
    });

    // ==========================
    // #PARALLAX
    // ==========================
    const parallaxElements = document.querySelectorAll<HTMLElement>("[data-parallax]");
    const onParallaxScroll = () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute("data-parallax") ?? "0.5");
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };
    window.addEventListener("scroll", onParallaxScroll);
    onParallaxScroll();

    // ==========================
    // #GITHUB INTEGRATION (client)
    // ==========================
    const GITHUB_USERNAME = "Arsh227";
    const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
    const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

    const CUSTOM_STATS = {
      useCustomValues: false,
      yearsExperience: 5,
      totalProjects: 50,
      aiProjects: 15,
      clientSatisfaction: 100,
      aiKeywords: [
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
      ],
    };

    const updateStatCounter = (currentValue: string, newValue: number) => {
      const statElement = document.querySelector<HTMLElement>(`[data-counter="${currentValue}"]`);
      if (!statElement) return;
      statElement.setAttribute("data-counter", String(newValue));
      statElement.textContent = String(newValue);
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return "yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    };

    const updateGitHubStats = (userData: any) => {
      const repoCount = document.querySelector<HTMLElement>('[data-counter="10"]');
      const followerCount = document.querySelector<HTMLElement>('[data-counter="1"]');
      const followingCount = document.querySelector<HTMLElement>('[data-counter="5"]');
      if (repoCount) repoCount.setAttribute("data-counter", String(userData.public_repos));
      if (followerCount) followerCount.setAttribute("data-counter", String(userData.followers));
      if (followingCount) followingCount.setAttribute("data-counter", String(userData.following));
      animateCounters();
    };

    const updateExperienceStats = (userData: any, reposData: any[]) => {
      let yearsExperience: number;
      let totalProjects: number;
      let aiProjects: number;
      let clientSatisfaction: number;

      if (CUSTOM_STATS.useCustomValues) {
        yearsExperience = CUSTOM_STATS.yearsExperience;
        totalProjects = CUSTOM_STATS.totalProjects;
        aiProjects = CUSTOM_STATS.aiProjects;
        clientSatisfaction = CUSTOM_STATS.clientSatisfaction;
      } else {
        const accountCreated = new Date(userData.created_at);
        const now = new Date();
        yearsExperience = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 365));

        aiProjects = reposData.filter((repo) => {
          const name = String(repo.name ?? "").toLowerCase();
          const description = String(repo.description ?? "").toLowerCase();
          return CUSTOM_STATS.aiKeywords.some((keyword) => name.includes(keyword) || description.includes(keyword));
        }).length;

        totalProjects = userData.public_repos;
        clientSatisfaction = 100;
      }

      // These values match the template markup.
      updateStatCounter("5", yearsExperience);
      updateStatCounter("50", totalProjects);
      updateStatCounter("15", aiProjects);
      updateStatCounter("100", clientSatisfaction);
    };

    const displayRepositories = (repos: any[]) => {
      const reposContainer = document.getElementById("github-repos");
      if (!reposContainer) return;

      const sortedRepos = [...repos].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const displayRepos = sortedRepos.slice(0, 6);

      const reposHTML = displayRepos
        .map((repo) => {
          const languagesTag = repo.language ? `<span class="language-tag">${repo.language}</span>` : "";
          const description = repo.description ? `<p class="repo-description">${repo.description}</p>` : "";

          return `
          <div class="repo-card" data-reveal>
            <div class="repo-header">
              <a href="${repo.html_url}" target="_blank" class="repo-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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

      reposContainer.innerHTML = reposHTML;

      // Trigger reveal animations for GitHub cards.
      window.setTimeout(() => {
        const newRevealElements = reposContainer.querySelectorAll<HTMLElement>("[data-reveal]");
        newRevealElements.forEach((element) => element.classList.add("revealed"));
      }, 100);
    };

    const displayGitHubError = () => {
      const reposContainer = document.getElementById("github-repos");
      if (!reposContainer) return;
      reposContainer.innerHTML = `
        <div class="repo-card" data-reveal>
          <p style="text-align: center; color: var(--white_a70); padding: 40px;">
            Unable to load repositories. Please check your internet connection or try again later.
          </p>
        </div>
      `;
    };

    const fetchGitHubData = async () => {
      try {
        const [userResponse, reposResponse] = await Promise.all([fetch(GITHUB_API_URL), fetch(GITHUB_REPOS_URL)]);
        if (!userResponse.ok || !reposResponse.ok) throw new Error("Failed to fetch GitHub data");

        const userData = await userResponse.json();
        const reposData = await reposResponse.json();

        updateGitHubStats(userData);
        updateExperienceStats(userData, reposData);
        displayRepositories(reposData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching GitHub data:", error);
        displayGitHubError();
      }
    };

    let refreshTimer: number | undefined;
    const startGitHub = async () => {
      // GitHub section may be on some routes only; guard by existence.
      const reposContainer = document.getElementById("github-repos");
      if (!reposContainer) return;

      await fetchGitHubData();
      refreshTimer = window.setInterval(() => {
        fetchGitHubData();
      }, 5 * 60 * 1000);
    };

    // GitHub integration is handled by `GithubIntegration` (separate component).
    // Keeping the older logic here would cause duplicate fetches, so we intentionally do not start it.

    // ==========================
    // Cleanup
    // ==========================
    return () => {
      if (document.readyState !== "complete") window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", activeElementOnScroll);
      window.removeEventListener("scroll", onBackTopScroll);
      window.removeEventListener("scroll", onParallaxScroll);
      io.disconnect();
      if (refreshTimer) window.clearInterval(refreshTimer);
      // Cursor listeners are removed automatically when component unmounts in most cases,
      // but we keep cleanup minimal to avoid missing references.
    };
  }, []);

  return null;
}


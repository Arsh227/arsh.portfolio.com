
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



const loadingElement = document.querySelector("[data-loading]");

window.addEventListener("load", function () {
  loadingElement.classList.add("loaded");
  document.body.classList.remove("active");
});




const [navTogglers, navLinks, navbar, overlay] = [
  document.querySelectorAll("[data-nav-toggler]"),
  document.querySelectorAll("[data-nav-link]"),
  document.querySelector("[data-navbar]"),
  document.querySelector("[data-overlay]")
];

const toggleNav = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("active");
}

addEventOnElements(navTogglers, "click", toggleNav);

const closeNav = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("active");
}

addEventOnElements(navLinks, "click", closeNav);



const header = document.querySelector("[data-header]");

const activeElementOnScroll = function () {
  if (window.scrollY > 50) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
}

window.addEventListener("scroll", activeElementOnScroll);




const letterBoxes = document.querySelectorAll("[data-letter-effect]");

let activeLetterBoxIndex = 0;
let lastActiveLetterBoxIndex = 0;
let totalLetterBoxDelay = 0;

const setLetterEffect = function () {


  for (let i = 0; i < letterBoxes.length; i++) {
 
    let letterAnimationDelay = 0;

   
    const letters = letterBoxes[i].textContent.trim();
 
    letterBoxes[i].textContent = "";

    for (let j = 0; j < letters.length; j++) {

   
      const span = document.createElement("span");

      span.style.animationDelay = `${letterAnimationDelay}s`;

  
      if (i === activeLetterBoxIndex) {
        span.classList.add("in");
      } else {
        span.classList.add("out");
      }

      span.textContent = letters[j];

     
      if (letters[j] === " ") span.classList.add("space");

      letterBoxes[i].appendChild(span);

    
      if (j >= letters.length - 1) break;
      // otherwise update
      letterAnimationDelay += 0.05;

    }

    if (i === activeLetterBoxIndex) {
      totalLetterBoxDelay = Number(letterAnimationDelay.toFixed(2));
    }

   
    if (i === lastActiveLetterBoxIndex) {
      letterBoxes[i].classList.add("active");
    } else {
      letterBoxes[i].classList.remove("active");
    }

  }

  setTimeout(function () {
    lastActiveLetterBoxIndex = activeLetterBoxIndex;

    activeLetterBoxIndex >= letterBoxes.length - 1 ? activeLetterBoxIndex = 0 : activeLetterBoxIndex++;

    setLetterEffect();
  }, (totalLetterBoxDelay * 1000) + 3000);

}


window.addEventListener("load", setLetterEffect);





const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  const bodyHeight = document.body.scrollHeight;
  const windowHeight = window.innerHeight;
  const scrollEndPos = bodyHeight - windowHeight;
  const totalScrollPercent = (window.scrollY / scrollEndPos) * 100;

  backTopBtn.textContent = `${totalScrollPercent.toFixed(0)}%`;

  if (totalScrollPercent > 5) {
    backTopBtn.classList.add("show");
  } else {
    backTopBtn.classList.remove("show");
  }
});




const revealElements = document.querySelectorAll("[data-reveal]");

const scrollReveal = function () {
  for (let i = 0; i < revealElements.length; i++) {
    const elementIsInScreen = revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15;

    if (elementIsInScreen) {
      revealElements[i].classList.add("revealed");
    } else {
      revealElements[i].classList.remove("revealed");
    }
  }
}

window.addEventListener("scroll", scrollReveal);

scrollReveal();




const cursor = document.querySelector("[data-cursor]");
const anchorElements = document.querySelectorAll("a");
const buttons = document.querySelectorAll("button");

document.body.addEventListener("mousemove", function (event) {
  setTimeout(function () {
    cursor.style.top = `${event.clientY}px`;
    cursor.style.left = `${event.clientX}px`;
  }, 100);
});

const hoverActive = function () { cursor.classList.add("hovered"); }

const hoverDeactive = function () { cursor.classList.remove("hovered"); }


addEventOnElements(anchorElements, "mouseover", hoverActive);
addEventOnElements(anchorElements, "mouseout", hoverDeactive);
addEventOnElements(buttons, "mouseover", hoverActive);
addEventOnElements(buttons, "mouseout", hoverDeactive);

document.body.addEventListener("mouseout", function () {
  cursor.classList.add("disabled");
});

document.body.addEventListener("mouseover", function () {
  cursor.classList.remove("disabled");
});



// Animated Counters
const animateCounters = function () {
  const counters = document.querySelectorAll("[data-counter]");
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute("data-counter"));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  });
};

// Skill Progress Bars
const animateSkillBars = function () {
  const skillBars = document.querySelectorAll("[data-skill]");
  
  skillBars.forEach(bar => {
    const skillLevel = bar.getAttribute("data-skill");
    const progressBar = bar.querySelector(".skill-progress");
    
    if (progressBar) {
      progressBar.style.width = skillLevel + "%";
    }
  });
};

// Enhanced Scroll Reveal with Counter Animation
const enhancedScrollReveal = function () {
  for (let i = 0; i < revealElements.length; i++) {
    const elementIsInScreen = revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15;

    if (elementIsInScreen) {
      revealElements[i].classList.add("revealed");
      
      // Trigger counter animation when counters come into view
      if (revealElements[i].querySelector("[data-counter]")) {
        animateCounters();
      }
      
      // Trigger skill bar animation when skill bars come into view
      if (revealElements[i].querySelector("[data-skill]")) {
        animateSkillBars();
      }
    } else {
      revealElements[i].classList.remove("revealed");
    }
  }
};

// Replace the original scrollReveal function
window.removeEventListener("scroll", scrollReveal);
window.addEventListener("scroll", enhancedScrollReveal);

// Interactive Project Cards
const addProjectInteractivity = function () {
  const projectCards = document.querySelectorAll(".gallery-card, .portfolio-card");
  
  projectCards.forEach(card => {
    card.addEventListener("mouseenter", function() {
      this.style.transform = "translateY(-10px)";
      this.style.transition = "transform 0.3s ease";
    });
    
    card.addEventListener("mouseleave", function() {
      this.style.transform = "translateY(0)";
    });
  });
};

// Initialize interactivity
document.addEventListener("DOMContentLoaded", function() {
  addProjectInteractivity();
});

// Parallax Effect for Background Elements
const addParallaxEffect = function () {
  const parallaxElements = document.querySelectorAll("[data-parallax]");
  
  window.addEventListener("scroll", function() {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.getAttribute("data-parallax") || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
};

// Initialize parallax
addParallaxEffect();

// GitHub API Integration
const GITHUB_USERNAME = 'Arsh227';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// ========================================
// CUSTOMIZABLE STATISTICS CONFIGURATION
// ========================================
// You can easily modify these values to override GitHub calculations
const CUSTOM_STATS = {
  // Set to true to use custom values, false to use GitHub data
  useCustomValues: false,
  
  // Custom values (only used if useCustomValues is true)
  yearsExperience: 5,        // Your years of experience
  totalProjects: 50,        // Total projects completed
  aiProjects: 15,           // Number of AI projects
  clientSatisfaction: 100,  // Client satisfaction percentage
  
  // AI project keywords for automatic detection
  aiKeywords: [
    'ai', 'ml', 'machine-learning', 'tensorflow', 'pytorch', 
    'neural', 'deep-learning', 'computer-vision', 'nlp', 
    'jarvis', 'intelligence', 'opencv', 'scikit-learn',
    'artificial', 'automation', 'chatbot', 'recommendation'
  ]
};

// Fetch GitHub user data
const fetchGitHubData = async function() {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(GITHUB_API_URL),
      fetch(GITHUB_REPOS_URL)
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('Failed to fetch GitHub data');
    }

    const userData = await userResponse.json();
    const reposData = await reposResponse.json();

    // Update GitHub stats
    updateGitHubStats(userData);
    
    // Update experience statistics with real GitHub data
    updateExperienceStats(userData, reposData);
    
    // Display repositories
    displayRepositories(reposData);

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    displayGitHubError();
  }
};

// Update GitHub statistics
const updateGitHubStats = function(userData) {
  const repoCount = document.querySelector('[data-counter="10"]');
  const followerCount = document.querySelector('[data-counter="1"]');
  const followingCount = document.querySelector('[data-counter="5"]');

  if (repoCount) repoCount.setAttribute('data-counter', userData.public_repos);
  if (followerCount) followerCount.setAttribute('data-counter', userData.followers);
  if (followingCount) followingCount.setAttribute('data-counter', userData.following);

  // Re-trigger counter animation
  animateCounters();
};

// Update experience statistics with GitHub data
const updateExperienceStats = function(userData, reposData) {
  let yearsExperience, totalProjects, aiProjects, clientSatisfaction;

  if (CUSTOM_STATS.useCustomValues) {
    // Use custom values
    yearsExperience = CUSTOM_STATS.yearsExperience;
    totalProjects = CUSTOM_STATS.totalProjects;
    aiProjects = CUSTOM_STATS.aiProjects;
    clientSatisfaction = CUSTOM_STATS.clientSatisfaction;
  } else {
    // Calculate from GitHub data
    const accountCreated = new Date(userData.created_at);
    const now = new Date();
    yearsExperience = Math.floor((now - accountCreated) / (1000 * 60 * 60 * 24 * 365));
    
    // Count AI-related projects based on repository names and descriptions
    aiProjects = reposData.filter(repo => {
      const name = repo.name.toLowerCase();
      const description = (repo.description || '').toLowerCase();
      return CUSTOM_STATS.aiKeywords.some(keyword => 
        name.includes(keyword) || description.includes(keyword)
      );
    }).length;

    totalProjects = userData.public_repos;
    clientSatisfaction = 100; // Always 100%
  }

  // Update the statistics with animation
  updateStatCounter('5', yearsExperience); // Years Experience
  updateStatCounter('50', totalProjects); // Projects Completed
  updateStatCounter('15', aiProjects); // AI Projects
  updateStatCounter('100', clientSatisfaction); // Client Satisfaction

  // Log the calculated values for debugging
  console.log('📊 Experience Statistics Updated:', {
    yearsExperience,
    totalProjects,
    aiProjects,
    clientSatisfaction
  });
};

// Update individual stat counter
const updateStatCounter = function(currentValue, newValue) {
  const statElement = document.querySelector(`[data-counter="${currentValue}"]`);
  if (statElement) {
    statElement.setAttribute('data-counter', newValue);
    statElement.textContent = newValue;
  }
};


// Display repositories
const displayRepositories = function(repos) {
  const reposContainer = document.getElementById('github-repos');
  
  if (!reposContainer) return;

  // Sort repositories by updated date (most recent first)
  const sortedRepos = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  
  // Take only the first 6 repositories
  const displayRepos = sortedRepos.slice(0, 6);

  const reposHTML = displayRepos.map(repo => `
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
      
      ${repo.description ? `<p class="repo-description">${repo.description}</p>` : ''}
      
      <div class="repo-footer">
        <div class="repo-languages">
          ${repo.language ? `<span class="language-tag">${repo.language}</span>` : ''}
        </div>
        <div class="repo-updated">
          Updated ${formatDate(repo.updated_at)}
        </div>
      </div>
    </div>
  `).join('');

  reposContainer.innerHTML = reposHTML;
  
  // Trigger reveal animations for new content
  setTimeout(() => {
    const newRevealElements = reposContainer.querySelectorAll('[data-reveal]');
    newRevealElements.forEach(element => {
      element.classList.add('revealed');
    });
  }, 100);
};

// Display error message
const displayGitHubError = function() {
  const reposContainer = document.getElementById('github-repos');
  if (reposContainer) {
    reposContainer.innerHTML = `
      <div class="repo-card" data-reveal>
        <p style="text-align: center; color: var(--white_a70); padding: 40px;">
          Unable to load repositories. Please check your internet connection or try again later.
        </p>
      </div>
    `;
  }
};

// Format date for display
const formatDate = function(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

// Auto-refresh GitHub data every 5 minutes
const refreshGitHubData = function() {
  setInterval(() => {
    fetchGitHubData();
  }, 5 * 60 * 1000); // 5 minutes
};

// Initialize GitHub integration when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Load GitHub data after a short delay to ensure page is ready
  setTimeout(() => {
    fetchGitHubData();
    refreshGitHubData();
  }, 1000);
});

// Enhanced scroll reveal for GitHub section
const githubScrollReveal = function() {
  const githubSection = document.getElementById('github');
  if (!githubSection) return;

  const sectionTop = githubSection.getBoundingClientRect().top;
  const sectionHeight = githubSection.offsetHeight;
  const windowHeight = window.innerHeight;

  if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
    // Section is in view, trigger GitHub data fetch if not already loaded
    const reposContainer = document.getElementById('github-repos');
    if (reposContainer && reposContainer.querySelector('.loading-repos')) {
      fetchGitHubData();
    }
  }
};

// Add GitHub scroll reveal to existing scroll event
window.addEventListener('scroll', function() {
  enhancedScrollReveal();
  githubScrollReveal();
});
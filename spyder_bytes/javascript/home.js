// Configuration
const config = {
  isLoggedIn: false,
  userName: "John Doe",
  userProfilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  userSkills: ["JavaScript", "Graphic Design", "Photography"]
};

// Posts Data
const posts = [
  {
      id: 1,
      title: "Learn Advanced JavaScript",
      description: "I can teach you advanced JavaScript concepts including ES6+, React, and Node.js",
      skills: ["JavaScript", "React", "Node.js"],
      author: "Jane Smith",
      authorPic: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
      id: 2,
      title: "Graphic Design Fundamentals",
      description: "Want to learn the basics of graphic design? I can help you get started with Adobe Photoshop and Illustrator",
      skills: ["Graphic Design", "Photoshop", "Illustrator"],
      author: "Mike Johnson",
      authorPic: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
      id: 3,
      title: "Photography Workshop",
      description: "Learn how to take professional photos with your DSLR camera",
      skills: ["Photography", "DSLR"],
      author: "Sarah Williams",
      authorPic: "https://randomuser.me/api/portraits/women/2.jpg"
  }
];

// DOM Elements
const authSection = document.getElementById('auth-section');
const postsTitle = document.getElementById('posts-title');
const postsContainer = document.getElementById('posts-container');

// Initialize App
function init() {
  setupAuth();
  
  // Check if we're on explore page
  if (window.location.pathname.includes('explore.html')) {
      setupSearch();
  } else {
      loadPosts();
  }
  
  setupEventListeners();
}

// Setup Search Functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      if (searchTerm.length > 2) {
          const filtered = posts.filter(post => 
              post.skills.some(skill => 
                  skill.toLowerCase().includes(searchTerm) ||
                  post.title.toLowerCase().includes(searchTerm) ||
                  post.description.toLowerCase().includes(searchTerm)
              )
          );
          displayPosts(filtered);
      } else if (searchTerm.length === 0) {
          displayPosts([]);
      }
  });
}

// Setup Authentication UI
function setupAuth() {
  if (config.isLoggedIn) {
      authSection.innerHTML = `
          <div class="flex items-center space-x-2">
              <img class="h-8 w-8 rounded-full" src="${config.userProfilePic}" alt="${config.userName}">
              <span class="text-sm font-medium text-gray-700">${config.userName}</span>
          </div>
      `;
      postsTitle.textContent = "Recommended for You";
  } else {
      authSection.innerHTML = `
          <div class="space-x-4">
              <a href="#" class="text-sm font-medium text-gray-700 hover:text-blue-600">Log in</a>
              <a href="#" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">Sign up</a>
          </div>
      `;
      postsTitle.textContent = "Discover Skills";
  }
}

// Load and Display Posts
function loadPosts() {
  let filteredPosts = filterPosts();
  displayPosts(filteredPosts);
}

// Filter Posts Based on User Skills
function filterPosts() {
  if (config.isLoggedIn) {
      const filtered = posts.filter(post => 
          post.skills.some(skill => config.userSkills.includes(skill))
      );
      return filtered.length > 0 ? filtered : getRandomPosts();
  }
  return posts;
}

// Get Random Posts
function getRandomPosts() {
  return [...posts].sort(() => 0.5 - Math.random()).slice(0, 3);
}

// Display Posts in UI
function displayPosts(posts) {
  postsContainer.innerHTML = '';
  posts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
  });
}

// Create Post Element
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post-card bg-white rounded-lg shadow-md overflow-hidden';
  postElement.innerHTML = `
      <div class="p-6">
          <div class="flex items-center mb-4">
              <img class="h-10 w-10 rounded-full mr-3" src="${post.authorPic}" alt="${post.author}">
              <div>
                  <h3 class="text-lg font-medium text-gray-900">${post.title}</h3>
                  <p class="text-sm text-gray-500">by ${post.author}</p>
              </div>
          </div>
          <p class="text-gray-600 mb-4">${post.description}</p>
          <div class="flex flex-wrap gap-2 mb-4">
              ${post.skills.map(skill => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${skill}</span>`).join('')}
          </div>
          <button class="w-full mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out">
              ${config.isLoggedIn ? 'View Details' : 'Sign up to Learn'}
          </button>
      </div>
  `;
  
  if (!config.isLoggedIn) {
      const button = postElement.querySelector('button');
      button.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Please sign up or log in to view this post');
      });
  }

  return postElement;
}

// Setup Event Listeners
function setupEventListeners() {
  // Additional event listeners can be added here
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
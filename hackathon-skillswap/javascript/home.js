import { Auth } from './auth.js';
import { PostManager } from './posts.js';
import { ChatManager } from './chat.js';
import { AuthUI } from './auth.js'; // Assuming AuthUI is exported from auth.js

// Global reference to postManager for modal submission
let postManager;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize authentication
    const auth = new Auth();
    const isLoggedIn = await auth.checkSession();
    
    // Initialize UI components
    const authUI = new AuthUI(auth);
    authUI.init();
    
    // Initialize post manager
    postManager = new PostManager(auth);
    await postManager.fetchPosts();
    
    // Initialize chat if logged in
    if (isLoggedIn) {
      const chatManager = new ChatManager(auth);
      chatManager.init();
      
      // Load user's saved posts
      if (typeof postManager.fetchSavedPosts === 'function') {
        await postManager.fetchSavedPosts();
      }
    }
    
    // Setup UI interactions
    setupSidebar();
    setupCreatePostModal();
    setupFilterEventListeners();
    setupMobileMenu();
    
    // Update UI based on auth status
    updateUIForAuthStatus(isLoggedIn);
    
  } catch (error) {
    console.error('Initialization error:', error);
    // Show error to user
    const errorElement = document.createElement('div');
    errorElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-4 right-4';
    errorElement.textContent = 'Failed to load application. Please refresh the page.';
    document.body.appendChild(errorElement);
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
});

function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  
  // Desktop toggle
  toggleBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
  
  // Restore sidebar state from localStorage
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    sidebar?.classList.add('collapsed');
  }
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  
  mobileMenuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    // Close when clicking outside
    if (!sidebar.classList.contains('hidden')) {
      const clickHandler = (e) => {
        if (!sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
          sidebar.classList.add('hidden');
          document.removeEventListener('click', clickHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', clickHandler), 10);
    }
  });
}

function setupCreatePostModal() {
  const modal = document.getElementById('post-modal');
  const createPostBtn = document.getElementById('create-post-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-post-btn');
  const postForm = document.getElementById('post-form');
  
  // Open modal
  createPostBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
  
  // Close modal handlers
  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };
  
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  
  // Close when clicking outside modal
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Form submission
  postForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = postForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Posting...';
    submitBtn.disabled = true;
    
    try {
      const formData = new FormData(postForm);
      const postData = {
        title: formData.get('title'),
        description: formData.get('description'),
        skills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s),
        level: formData.get('level') || 'beginner'
      };
      
      const success = await postManager.createPost(postData);
      if (success) {
        closeModal();
        postForm.reset();
        
        // Show success message
        showToast('Post created successfully!', 'success');
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      showToast('Failed to create post. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

function setupFilterEventListeners() {
  const skillFilter = document.getElementById('skill-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  skillFilter?.addEventListener('change', () => {
    postManager.applyFilters({
      skill: skillFilter.value,
      sort: sortFilter.value
    });
  });
  
  sortFilter?.addEventListener('change', () => {
    postManager.applyFilters({
      skill: skillFilter.value,
      sort: sortFilter.value
    });
  });
}

function updateUIForAuthStatus(isLoggedIn) {
  // Update page title based on auth status
  const postsTitle = document.getElementById('posts-title');
  if (postsTitle) {
    postsTitle.textContent = isLoggedIn ? 'Recommended for You' : 'Discover Skills';
  }
  
  // Show/hide create post button
  const createPostBtn = document.getElementById('create-post-btn');
  if (createPostBtn) {
    createPostBtn.classList.toggle('hidden', !isLoggedIn);
  }
  
  // Update filter options if needed
  if (isLoggedIn && postManager?.userSkills?.length) {
    const skillFilter = document.getElementById('skill-filter');
    if (skillFilter) {
      // Clear existing options except the first one
      while (skillFilter.options.length > 1) {
        skillFilter.remove(1);
      }
      
      // Add user's skills
      postManager.userSkills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        skillFilter.appendChild(option);
      });
    }
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupSidebar,
    setupCreatePostModal,
    setupFilterEventListeners,
    updateUIForAuthStatus
  };
}
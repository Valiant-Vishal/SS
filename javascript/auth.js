class Auth {
    constructor() {
      this.isLoggedIn = false;
      this.user = null;
      this.token = null;
    }
  
    async checkSession() {
      try {
        const token = localStorage.getItem('skillswap_token');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            this.user = data.user;
            this.token = token;
            this.isLoggedIn = true;
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Session check failed:', error);
        return false;
      }
    }
  
    async login(email, password) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          this.user = data.user;
          this.token = data.token;
          this.isLoggedIn = true;
          localStorage.setItem('skillswap_token', data.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    }
  
    async register(userData) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
  
        if (response.ok) {
          const data = await response.json();
          this.user = data.user;
          this.token = data.token;
          this.isLoggedIn = true;
          localStorage.setItem('skillswap_token', data.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Registration failed:', error);
        return false;
      }
    }
  
    logout() {
      localStorage.removeItem('skillswap_token');
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;
      window.location.href = '/';
    }
  }
  
  // Auth UI Manager
  class AuthUI {
    constructor(auth) {
      this.auth = auth;
      this.loginForm = document.getElementById('login-form');
      this.registerForm = document.getElementById('register-form');
      this.authSection = document.getElementById('auth-section');
    }
  
    init() {
      this.renderAuthState();
      this.setupEventListeners();
    }
  
    renderAuthState() {
      if (this.auth.isLoggedIn) {
        this.authSection.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="relative group">
              <div class="flex items-center space-x-2 cursor-pointer">
                <img class="h-8 w-8 rounded-full" src="${this.auth.user.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${this.auth.user.name}">
                <span class="text-sm font-medium">${this.auth.user.name}</span>
              </div>
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                <a href="/profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a href="/settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
              </div>
            </div>
            <button id="create-post-btn" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              <i class="fas fa-plus mr-1"></i> New Post
            </button>
          </div>
        `;
      } else {
        this.authSection.innerHTML = `
          <div class="flex items-center space-x-4">
            <button id="login-btn" class="text-sm font-medium text-gray-700 hover:text-blue-600">Log in</button>
            <button id="register-btn" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">Sign up</button>
          </div>
        `;
      }
    }
  
    setupEventListeners() {
      document.addEventListener('click', (e) => {
        if (e.target.id === 'logout-btn') {
          this.auth.logout();
        }
        if (e.target.id === 'login-btn') {
          this.showLoginModal();
        }
        if (e.target.id === 'register-btn') {
          this.showRegisterModal();
        }
      });
    }
  
    showLoginModal() {
      // Implement modal display
    }
  
    showRegisterModal() {
      // Implement modal display
    }
  }
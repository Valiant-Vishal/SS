class PostManager {
    constructor(auth) {
      this.auth = auth;
      this.posts = [];
      this.postsContainer = document.getElementById('posts-container');
    }
  
    async fetchPosts(filter = {}) {
      try {
        const response = await fetch('/api/posts', {
          headers: {
            'Authorization': this.auth.token ? `Bearer ${this.auth.token}` : ''
          }
        });
        
        if (response.ok) {
          this.posts = await response.json();
          this.renderPosts();
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    }
  
    async createPost(postData) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.auth.token}`
          },
          body: JSON.stringify(postData)
        });
  
        if (response.ok) {
          const newPost = await response.json();
          this.posts.unshift(newPost);
          this.renderPosts();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to create post:', error);
        return false;
      }
    }
  
    async likePost(postId) {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.auth.token}`
          }
        });
  
        if (response.ok) {
          const updatedPost = await response.json();
          this.updatePostInList(updatedPost);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to like post:', error);
        return false;
      }
    }
  
    async savePost(postId) {
      try {
        const response = await fetch(`/api/posts/${postId}/save`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.auth.token}`
          }
        });
  
        if (response.ok) {
          const updatedPost = await response.json();
          this.updatePostInList(updatedPost);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to save post:', error);
        return false;
      }
    }
  
    updatePostInList(updatedPost) {
      const index = this.posts.findIndex(p => p.id === updatedPost.id);
      if (index !== -1) {
        this.posts[index] = updatedPost;
        this.renderPosts();
      }
    }
  
    renderPosts() {
      this.postsContainer.innerHTML = '';
      this.posts.forEach(post => {
        const postElement = this.createPostElement(post);
        this.postsContainer.appendChild(postElement);
      });
    }
  
    createPostElement(post) {
      const postElement = document.createElement('div');
      postElement.className = 'post-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
      
      const isLiked = post.likes?.includes(this.auth.user?.id);
      const isSaved = post.saves?.includes(this.auth.user?.id);
      
      postElement.innerHTML = `
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img class="h-10 w-10 rounded-full mr-3" src="${post.author.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${post.author.name}">
            <div>
              <h3 class="text-lg font-medium text-gray-900">${post.title}</h3>
              <p class="text-sm text-gray-500">by ${post.author.name}</p>
            </div>
          </div>
          <p class="text-gray-600 mb-4">${post.description}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            ${post.skills.map(skill => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${skill}</span>`).join('')}
          </div>
          <div class="flex justify-between items-center">
            <div class="flex space-x-4">
              <button class="like-btn flex items-center text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}" data-post-id="${post.id}">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart mr-1"></i>
                <span>${post.likes?.length || 0}</span>
              </button>
              <button class="save-btn text-sm ${isSaved ? 'text-blue-500' : 'text-gray-500'}" data-post-id="${post.id}">
                <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
              </button>
            </div>
            <button class="view-btn px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              ${this.auth.isLoggedIn ? 'View Details' : 'Sign up to Learn'}
            </button>
          </div>
        </div>
      `;
  
      if (this.auth.isLoggedIn) {
        postElement.querySelector('.like-btn').addEventListener('click', (e) => {
          e.preventDefault();
          this.likePost(post.id);
        });
  
        postElement.querySelector('.save-btn').addEventListener('click', (e) => {
          e.preventDefault();
          this.savePost(post.id);
        });
      }
  
      return postElement;
    }
  }
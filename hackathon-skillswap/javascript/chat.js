class ChatManager {
    constructor(auth) {
      this.auth = auth;
      this.socket = null;
      this.currentChat = null;
      this.chats = [];
    }
  
    init() {
      if (this.auth.isLoggedIn) {
        this.connectSocket();
        this.fetchChats();
        this.setupEventListeners();
      }
    }
  
    connectSocket() {
      this.socket = io('/chat', {
        auth: {
          token: this.auth.token
        }
      });
  
      this.socket.on('connect', () => {
        console.log('Connected to chat server');
      });
  
      this.socket.on('new-message', (message) => {
        if (this.currentChat && this.currentChat.id === message.chatId) {
          this.appendMessage(message);
        }
      });
  
      this.socket.on('chat-list', (chats) => {
        this.chats = chats;
        this.renderChatList();
      });
    }
  
    async fetchChats() {
      try {
        const response = await fetch('/api/chats', {
          headers: {
            'Authorization': `Bearer ${this.auth.token}`
          }
        });
        
        if (response.ok) {
          this.chats = await response.json();
          this.renderChatList();
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    }
  
    async startChat(userId) {
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.auth.token}`
          },
          body: JSON.stringify({ participantId: userId })
        });
  
        if (response.ok) {
          const chat = await response.json();
          this.openChat(chat);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to start chat:', error);
        return false;
      }
    }
  
    openChat(chat) {
      this.currentChat = chat;
      this.renderChat();
    }
  
    sendMessage(content) {
      if (!this.currentChat) return;
      
      const message = {
        chatId: this.currentChat.id,
        content,
        sender: this.auth.user.id
      };
  
      this.socket.emit('send-message', message);
      this.appendMessage({
        ...message,
        sender: this.auth.user,
        createdAt: new Date().toISOString()
      });
    }
  
    appendMessage(message) {
      const isCurrentUser = message.sender.id === this.auth.user.id;
      const messagesContainer = document.getElementById('chat-messages');
      
      const messageElement = document.createElement('div');
      messageElement.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`;
      
      messageElement.innerHTML = `
        <div class="${isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg py-2 px-4 max-w-xs lg:max-w-md">
          <div class="flex items-center mb-1">
            ${!isCurrentUser ? `<img src="${message.sender.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" class="w-6 h-6 rounded-full mr-2" alt="${message.sender.name}">` : ''}
            <span class="text-sm font-medium">${isCurrentUser ? 'You' : message.sender.name}</span>
          </div>
          <p class="text-gray-800">${message.content}</p>
          <p class="text-xs text-gray-500 text-right mt-1">${new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      `;
      
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  
    renderChatList() {
      const chatList = document.getElementById('chat-list');
      if (!chatList) return;
      
      chatList.innerHTML = this.chats.map(chat => {
        const otherUser = chat.participants.find(p => p.id !== this.auth.user.id);
        const lastMessage = chat.messages[chat.messages.length - 1];
        
        return `
          <div class="chat-item p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50" data-chat-id="${chat.id}">
            <div class="flex items-center">
              <img src="${otherUser.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" class="w-10 h-10 rounded-full mr-3" alt="${otherUser.name}">
              <div class="flex-1">
                <h4 class="font-medium">${otherUser.name}</h4>
                ${lastMessage ? `<p class="text-sm text-gray-500 truncate">${lastMessage.sender.id === this.auth.user.id ? 'You: ' : ''}${lastMessage.content}</p>` : ''}
              </div>
              ${chat.unreadCount > 0 ? `<span class="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${chat.unreadCount}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  
    renderChat() {
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer) return;
      
      const otherUser = this.currentChat.participants.find(p => p.id !== this.auth.user.id);
      
      chatContainer.innerHTML = `
        <div class="flex flex-col h-full">
          <div class="border-b border-gray-200 p-4 flex items-center">
            <img src="${otherUser.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" class="w-10 h-10 rounded-full mr-3" alt="${otherUser.name}">
            <h3 class="font-medium">${otherUser.name}</h3>
          </div>
          <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
            ${this.currentChat.messages.map(message => {
              const isCurrentUser = message.sender.id === this.auth.user.id;
              return `
                <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4">
                  <div class="${isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg py-2 px-4 max-w-xs lg:max-w-md">
                    <div class="flex items-center mb-1">
                      ${!isCurrentUser ? `<img src="${message.sender.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'}" class="w-6 h-6 rounded-full mr-2" alt="${message.sender.name}">` : ''}
                      <span class="text-sm font-medium">${isCurrentUser ? 'You' : message.sender.name}</span>
                    </div>
                    <p class="text-gray-800">${message.content}</p>
                    <p class="text-xs text-gray-500 text-right mt-1">${new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="border-t border-gray-200 p-4">
            <form id="message-form" class="flex">
              <input type="text" id="message-input" class="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message...">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      `;
      
      const messagesContainer = document.getElementById('chat-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      document.getElementById('message-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('message-input');
        if (input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });
    }
  
    setupEventListeners() {
      document.addEventListener('click', (e) => {
        const chatItem = e.target.closest('.chat-item');
        if (chatItem) {
          const chatId = chatItem.dataset.chatId;
          const chat = this.chats.find(c => c.id === chatId);
          if (chat) {
            this.openChat(chat);
          }
        }
      });
    }
  }
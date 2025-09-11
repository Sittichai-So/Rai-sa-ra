<template>
  <div v-if="displayUsers.length" class="typing-indicator-container">
    <div class="typing-bubble">
      <!-- Avatar(s) -->
      <div class="typing-avatars">
        <b-avatar
          v-for="user in displayAvatars"
          :key="user.userId"
          :text="getInitials(user.username)"
          :src="user.avatar"
          size="20"
          class="typing-avatar"
          variant="secondary"
        />
        <div v-if="remainingCount > 0" class="more-indicator">
          +{{ remainingCount }}
        </div>
      </div>

      <!-- Animated dots -->
      <div class="typing-animation">
        <div class="typing-dot" />
        <div class="typing-dot" />
        <div class="typing-dot" />
      </div>
    </div>

    <!-- Text indicator -->
    <div class="typing-text">
      <small class="text-muted">
        {{ getTypingText() }}
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TypingIndicator',
  props: {
    users: {
      type: Array,
      default: () => []
      // Expected format: [{ userId, username, avatar }, ...]
    },
    maxAvatars: {
      type: Number,
      default: 3
    },
    currentUserId: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayUsers () {
      // Filter out current user and return unique users
      const filtered = this.users.filter(user => user.userId !== this.currentUserId)

      // Remove duplicates based on userId
      const unique = filtered.filter((user, index, self) =>
        index === self.findIndex(u => u.userId === user.userId)
      )

      return unique
    },

    displayAvatars () {
      return this.displayUsers.slice(0, this.maxAvatars)
    },

    remainingCount () {
      return Math.max(0, this.displayUsers.length - this.maxAvatars)
    }
  },
  methods: {
    getInitials (username) {
      if (!username) { return '?' }
      return username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },

    getTypingText () {
      const count = this.displayUsers.length

      if (count === 0) { return '' }

      if (count === 1) {
        return `${this.displayUsers[0].username} กำลังพิมพ์...`
      }

      if (count === 2) {
        return `${this.displayUsers[0].username} และ ${this.displayUsers[1].username} กำลังพิมพ์...`
      }

      if (count === 3) {
        return `${this.displayUsers[0].username}, ${this.displayUsers[1].username} และ ${this.displayUsers[2].username} กำลังพิมพ์...`
      }

      return `${this.displayUsers[0].username}, ${this.displayUsers[1].username} และอีก ${count - 2} คน กำลังพิมพ์...`
    }
  }
}
</script>

<style scoped>
.typing-indicator-container {
  display: flex;
  align-items: flex-end;
  margin: 8px 16px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-bubble {
  background: #f8f9fa;
  border-radius: 18px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
  margin-bottom: 2px;
}

.typing-avatars {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.typing-avatar {
  margin-right: -4px;
  border: 2px solid white;
  position: relative;
  z-index: 1;
}

.typing-avatar:first-child {
  z-index: 3;
}

.typing-avatar:nth-child(2) {
  z-index: 2;
}

.typing-avatar:nth-child(3) {
  z-index: 1;
}

.more-indicator {
  background: #6c757d;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  margin-left: 4px;
  border: 2px solid white;
}

.typing-animation {
  display: flex;
  align-items: center;
  gap: 3px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6c757d;
  animation: typingPulse 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingPulse {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.typing-text {
  margin-left: 8px;
  align-self: flex-end;
  margin-bottom: 4px;
}

.typing-bubble.style-minimal {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 8px 12px;
}

.typing-bubble.style-colored {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #e1bee7;
}

@media (max-width: 768px) {
  .typing-indicator-container {
    margin: 6px 12px;
  }

  .typing-bubble {
    padding: 8px 12px;
  }

  .typing-avatars {
    margin-right: 8px;
  }

  .typing-avatar {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
  }

  .more-indicator {
    width: 16px;
    height: 16px;
    font-size: 0.5rem;
  }

  .typing-dot {
    width: 4px;
    height: 4px;
  }
}

@media (prefers-color-scheme: dark) {
  .typing-bubble {
    background: #2d3748;
    border-color: #4a5568;
  }

  .typing-dot {
    background: #a0aec0;
  }

  .more-indicator {
    background: #4a5568;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing-dot {
    animation: none;
  }

  .typing-indicator-container {
    animation: none;
  }
}

[dir="rtl"] .typing-indicator-container {
  flex-direction: row-reverse;
}

[dir="rtl"] .typing-avatar {
  margin-right: 0;
  margin-left: -4px;
}

[dir="rtl"] .typing-text {
  margin-left: 0;
  margin-right: 8px;
}
</style>

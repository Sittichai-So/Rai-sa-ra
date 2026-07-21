// components/TypingIndicator.vue
<template>
  <transition name="typing-fade">
    <div v-if="isTyping" class="modern-typing-indicator">
      <div class="typing-bubble">
        <div class="typing-dots">
          <span class="dot" />
          <span class="dot" />
          <span class="dot" />
        </div>
        <span class="typing-text">{{ typingText }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModernTypingIndicator',
  props: {
    typingUsers: { type: Array, default: () => [] }
  },
  computed: {
    isTyping () {
      return this.typingUsers.length > 0
    },

    typingText () {
      if (this.typingUsers.length === 1) {
        return `${this.typingUsers[0]} กำลังพิมพ์...`
      }
      if (this.typingUsers.length === 2) {
        return `${this.typingUsers[0]} และ ${this.typingUsers[1]} กำลังพิมพ์...`
      }
      return 'หลายคนกำลังพิมพ์...'
    }
  }
}
</script>

<style scoped>
.modern-typing-indicator {
  --ink: #101014;
  --paper-soft: #1b1b25;
  --violet: #7c6ff5;
  --coral: #ff5c4d;
  --white: #ffffff;
  --line-sm: 2px;
  --shadow-xs: 2px 2px 0 var(--ink);
  --radius-pill: 999px;

  padding: 6px 20px;
}

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--white);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  border: var(--line-sm) dashed var(--ink);
  box-shadow: var(--shadow-xs);
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--violet);
  border: 1px solid var(--ink);
  animation: typingBounce 1.4s infinite;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
  background: var(--coral);
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

.typing-text {
  font-size: 0.82rem;
  color: var(--ink);
  font-weight: 700;
}

/* Transitions */
.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* Responsive */
@media (max-width: 768px) {
  .modern-typing-indicator {
    padding: 5px 16px;
  }

  .typing-bubble {
    padding: 7px 12px;
    gap: 8px;
  }

  .typing-dots .dot {
    width: 6px;
    height: 6px;
  }

  .typing-text {
    font-size: 0.78rem;
  }
}

@media (max-width: 640px) {
  .modern-typing-indicator {
    padding: 4px 14px;
  }

  .typing-bubble {
    padding: 6px 10px;
    gap: 7px;
  }

  .typing-dots .dot {
    width: 5px;
    height: 5px;
    gap: 3px;
  }

  .typing-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .modern-typing-indicator {
    padding: 4px 12px;
  }

  .typing-bubble {
    padding: 5px 9px;
    gap: 6px;
  }

  .typing-dots .dot {
    width: 5px;
    height: 5px;
    gap: 2px;
  }

  .typing-text {
    font-size: 0.74rem;
  }
}

@media (max-width: 360px) {
  .modern-typing-indicator {
    padding: 3px 10px;
  }

  .typing-bubble {
    padding: 4px 8px;
    gap: 5px;
  }

  .typing-dots .dot {
    width: 4px;
    height: 4px;
  }

  .typing-text {
    font-size: 0.7rem;
  }
}
</style>

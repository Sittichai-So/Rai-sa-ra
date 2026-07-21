<!-- MessageInput.vue -->
<template>
  <div class="message-input-container">
    <div v-if="replyTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header d-flex justify-content-between align-items-center">
          <div class="reply-info">
            <i class="fas fa-reply mr-2" />
            <span class="font-weight-bold">ตอบกลับ {{ replyTo.username }}</span>
          </div>
          <button class="reply-close" @click="cancelReply">
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="reply-message">
          {{ replyTo.content }}
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper d-flex align-items-center">
        <div class="text-input-wrapper flex-grow-1 d-flex align-items-center position-relative">
          <textarea
            ref="textarea"
            v-model="messageText"
            class="form-control message-input"
            :placeholder="replyTo ? `ตอบกลับ ${replyTo.username}...` : 'พิมพ์ข้อความ...'"
            rows="1"
            @keydown.enter.exact.prevent="onEnter"
            @keydown.shift.enter.exact="addNewLine"
            @input="handleInput"
          />

          <button class="action-btn emoji-btn position-absolute" @click="toggleEmojiPicker">
            <i class="fas fa-smile" />
          </button>
        </div>

        <button :disabled="!canSend" :class="['send-btn', { active: canSend }]" @click="onEnter">
          <i v-if="sending" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-paper-plane" />
        </button>
      </div>
    </div>

    <EmojiPicker
      v-if="showEmojiPicker"
      :chat-theme="chatTheme"
      @emoji-selected="addEmoji"
      @close="showEmojiPicker = false"
    />
  </div>
</template>

<script>
import EmojiPicker from '~/components/EmojiPicker.vue'

export default {
  components: { EmojiPicker },
  props: {
    replyTo: {
      type: Object,
      default: null
    },
    chatTheme: {
      type: String,
      default: 'default'
    }
  },
  data () {
    return {
      messageText: '',
      sending: false,
      showEmojiPicker: false
    }
  },
  computed: {
    canSend () {
      return this.messageText.trim().length > 0
    }
  },
  methods: {
    handleInput (event) {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    },

    addNewLine () {
      this.messageText += '\n'
    },

    onEnter () {
      if (!this.canSend || this.sending) { return }

      this.sending = true

      this.$emit('send-message', {
        content: this.messageText.trim(),
        files: [],
        replyTo: this.replyTo
      })

      this.messageText = ''
      this.$refs.textarea.style.height = 'auto'

      setTimeout(() => {
        this.sending = false
      }, 500)
    },

    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
    },

    addEmoji (emoji) {
      const textarea = this.$refs.textarea
      if (!textarea) {
        console.error('❌ Textarea ref not found')
        return
      }

      console.log('✅ Emoji received:', emoji)
      const cursorPos = textarea.selectionStart || 0
      const textBefore = this.messageText.substring(0, cursorPos)
      const textAfter = this.messageText.substring(cursorPos)
      const val = typeof emoji === 'string' ? emoji : (emoji.native || '')

      this.messageText = textBefore + val + textAfter

      this.$nextTick(() => {
        const newPos = cursorPos + val.length
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
        console.log('✅ Emoji added at position:', newPos)
      })

      this.showEmojiPicker = false
    },

    focusInput () {
      this.$refs.textarea?.focus()
    },

    cancelReply () {
      this.$emit('cancel-reply')
    }
  }
}
</script>

<style scoped>
.message-input-container {
  --ink: #101014;
  --paper-soft: #1b1b25;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line: 3px;
  --line-sm: 2px;
  --shadow-sm: 4px 4px 0 var(--ink);
  --shadow-xs: 2px 2px 0 var(--ink);
  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-pill: 999px;
  --font-display: 'Space Grotesk', 'Noto Sans Thai', sans-serif;

  position: relative;
  background: var(--paper-soft);
  padding: 14px 20px 18px;
}

/* ---------- Reply preview ---------- */
.reply-preview {
  padding: 0 0 12px;
}

.reply-content {
  position: relative;
  background: var(--cream);
  border: var(--line-sm) solid var(--ink);
  border-left: 6px solid var(--violet);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  box-shadow: var(--shadow-xs);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--violet);
  margin-bottom: 4px;
  font-weight: 700;
}

.reply-close {
  background: var(--coral);
  border: var(--line-sm) solid var(--ink);
  color: var(--white);
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: transform 0.15s ease;
}

.reply-close:hover { transform: rotate(90deg); }

.reply-message {
  font-size: 0.85rem;
  color: var(--ink);
  opacity: 0.75;
  line-height: 1.4;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- Input pill ---------- */
.input-area { padding: 0; }

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: var(--white);
  border: var(--line) solid var(--ink);
  border-radius: var(--radius-pill);
  padding: 6px 8px 6px 18px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.input-wrapper:focus-within {
  box-shadow: 6px 6px 0 var(--violet);
  transform: translate(-1px, -1px);
}

.text-input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.message-input {
  border: none;
  background: transparent;
  resize: none;
  padding: 10px 50px 10px 0;
  font-size: 0.95rem;
  line-height: 1.5;
  max-height: 120px;
  overflow-y: auto;
  flex: 1;
  color: var(--ink);
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial Unicode MS', sans-serif;
  box-shadow: none !important;
}

.message-input:focus {
  box-shadow: none;
  outline: none;
}

.message-input::placeholder {
  color: rgba(16, 16, 20, 0.4);
}

.message-input::-webkit-scrollbar { width: 4px; }
.message-input::-webkit-scrollbar-track { background: transparent; }
.message-input::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 2px; }

.action-btn.emoji-btn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: var(--yellow);
  border: var(--line-sm) solid var(--ink);
  color: var(--ink);
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
  z-index: 10;
}

.action-btn.emoji-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-xs);
}

.send-btn {
  background: var(--cream);
  border: var(--line-sm) solid var(--ink);
  color: var(--ink);
  cursor: pointer;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  flex-shrink: 0;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.send-btn.active {
  background: var(--coral);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.send-btn.active:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}

.send-btn.active:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.send-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.send-btn i { font-size: 1.05rem; }

.reply-preview {
  margin-bottom: 8px;
  border-left: 3px solid var(--violet);
  padding-left: 10px;
}

.reply-header {
  margin-bottom: 4px;
}

.reply-info {
  font-size: 0.85rem;
  color: var(--violet);
}

.reply-message {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.reply-close:hover { color: var(--coral); }

@media (max-width: 768px) {
  .message-input-container { padding: 12px 16px 16px; }
  .action-btn.emoji-btn { width: 30px; height: 30px; font-size: 0.85rem; }
  .send-btn { width: 40px; height: 40px; }
  .send-btn i { font-size: 0.95rem; }
  .message-input { font-size: 14px; padding: 10px 45px 10px 14px; }
  .reply-preview { margin-bottom: 6px; padding-left: 8px; }
  .reply-info { font-size: 0.8rem; }
  .reply-message { font-size: 0.75rem; }
}

@media (max-width: 640px) {
  .message-input-container { padding: 10px 14px 14px; }
  .action-btn.emoji-btn { width: 28px; height: 28px; font-size: 0.8rem; right: 5px; bottom: 5px; }
  .send-btn { width: 38px; height: 38px; margin-left: 6px; }
  .send-btn i { font-size: 0.9rem; }
  .message-input { font-size: 14px; padding: 9px 42px 9px 12px; min-height: 40px; }
  .reply-preview { margin-bottom: 5px; padding-left: 7px; border-left-width: 2.5px; }
  .reply-info { font-size: 0.75rem; }
  .reply-message { font-size: 0.7rem; }
}

@media (max-width: 480px) {
  .message-input-container { padding: 8px 12px 12px; }
  .action-btn.emoji-btn { width: 26px; height: 26px; font-size: 0.75rem; right: 4px; bottom: 4px; }
  .send-btn { width: 36px; height: 36px; margin-left: 5px; }
  .send-btn i { font-size: 0.85rem; }
  .message-input { font-size: 14px; padding: 8px 38px 8px 10px; min-height: 38px; }
  .reply-preview { margin-bottom: 4px; padding-left: 6px; border-left-width: 2px; }
  .reply-info { font-size: 0.7rem; }
  .reply-message { font-size: 0.65rem; max-width: calc(100vw - 120px); }
  .reply-close { width: 20px; height: 20px; font-size: 0.7rem; }
}

@media (max-width: 360px) {
  .message-input-container { padding: 6px 10px 10px; }
  .action-btn.emoji-btn { width: 24px; height: 24px; font-size: 0.7rem; }
  .send-btn { width: 34px; height: 34px; }
  .message-input { min-height: 36px; padding: 7px 36px 7px 9px; }
  .reply-preview { margin-bottom: 3px; padding-left: 5px; }
  .reply-info { font-size: 0.65rem; }
  .reply-message { font-size: 0.6rem; }
}
</style>

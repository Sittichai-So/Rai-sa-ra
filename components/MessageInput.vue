<!-- MessageInput.vue -->
<template>
  <div class="message-input-container" :class="{ 'has-reply': !!replyTo }">
    <transition name="reply-slide">
      <div v-if="replyTo" class="reply-bar">
        <span class="reply-accent" />
        <i class="fas fa-reply reply-icon" />
        <div class="reply-body">
          <span class="reply-to-name">ตอบกลับ {{ replyTo.username }}</span>
          <span class="reply-snippet">{{ replyTo.content }}</span>
        </div>
        <button class="reply-cancel" type="button" title="ยกเลิกการตอบกลับ" @click="cancelReply">
          <i class="fas fa-times" />
        </button>
      </div>
    </transition>

    <div class="input-area">
      <div class="input-wrapper d-flex align-items-center">
        <button
          class="action-btn attach-btn"
          type="button"
          title="แนบไฟล์หรือรูปภาพ"
          :disabled="uploading"
          @click="$refs.fileInput.click()"
        >
          <i v-if="uploading" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-paperclip" />
        </button>
        <input
          ref="fileInput"
          type="file"
          class="d-none"
          accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.txt,.zip"
          @change="onFileSelected"
        >

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
      showEmojiPicker: false,
      uploading: false
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

      // ส่งสัญญาณ "กำลังพิมพ์" แบบ debounce
      this.$emit('typing-start')
      clearTimeout(this._typingTimer)
      this._typingTimer = setTimeout(() => this.$emit('typing-stop'), 1500)
    },

    stopTyping () {
      clearTimeout(this._typingTimer)
      this.$emit('typing-stop')
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

      this.stopTyping()
      this.messageText = ''
      this.$refs.textarea.style.height = 'auto'

      setTimeout(() => {
        this.sending = false
      }, 500)
    },

    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
    },

    onFileSelected (e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file) { return }

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        this.$emit('file-error', 'ไฟล์มีขนาดใหญ่เกิน 10MB')
        return
      }

      this.$emit('send-file', file)
    },

    setUploading (val) {
      this.uploading = val
    },

    addEmoji (emoji) {
      const textarea = this.$refs.textarea
      const val = typeof emoji === 'string' ? emoji : (emoji.native || '')
      if (!textarea) {
        this.messageText += val
        this.showEmojiPicker = false
        return
      }

      const cursorPos = textarea.selectionStart || 0
      const textBefore = this.messageText.substring(0, cursorPos)
      const textAfter = this.messageText.substring(cursorPos)

      this.messageText = textBefore + val + textAfter

      this.$nextTick(() => {
        const newPos = cursorPos + val.length
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
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
  --surface-raised: #262636;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --yellow: #ffc94d;
  --white: #ffffff;
  --field-text: #f3f1ec;
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

/* ---------- Reply bar (compact, sits flush above the input pill) ---------- */
.reply-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-raised);
  border: var(--line-sm) solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  padding: 8px 10px 8px 12px;
  margin-bottom: 10px;
  overflow: hidden;
}

.reply-accent {
  flex-shrink: 0;
  align-self: stretch;
  width: 4px;
  border-radius: 2px;
  background: var(--violet);
}

.reply-icon {
  flex-shrink: 0;
  color: var(--violet);
  font-size: 0.85rem;
}

.reply-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.reply-to-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--violet);
}

.reply-snippet {
  font-size: 0.8rem;
  color: rgba(243, 241, 236, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-cancel {
  flex-shrink: 0;
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
  font-size: 0.68rem;
  transition: transform 0.15s ease;
}

.reply-cancel:hover { transform: rotate(90deg); }

.reply-slide-enter-active,
.reply-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease, margin 0.18s ease;
}

.reply-slide-enter,
.reply-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
  margin-bottom: 0;
}

/* ---------- Input pill ---------- */
.input-area { padding: 0; }

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: var(--surface-raised);
  border: var(--line-sm) solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-pill);
  padding: 6px 8px 6px 18px;
  transition: border-color 0.15s ease;
}

.input-wrapper:focus-within {
  border-color: var(--violet);
}

.has-reply .input-wrapper {
  border-color: var(--violet);
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
  color: var(--field-text);
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Arial Unicode MS', sans-serif;
  box-shadow: none !important;
}

.message-input:focus {
  box-shadow: none;
  outline: none;
}

.message-input::placeholder {
  color: rgba(243, 241, 236, 0.4);
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

.action-btn.attach-btn {
  background: transparent;
  border: none;
  color: rgba(243, 241, 236, 0.55);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  flex-shrink: 0;
  transition: color 0.15s ease, background 0.15s ease;
}

.action-btn.attach-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--field-text);
}

.action-btn.attach-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.send-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(243, 241, 236, 0.5);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  flex-shrink: 0;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.send-btn.active {
  background: var(--coral);
  color: var(--white);
}

.send-btn.active:hover {
  transform: scale(1.06);
}

.send-btn.active:active {
  transform: scale(0.96);
}

.send-btn:disabled {
  cursor: not-allowed;
}

.send-btn i { font-size: 1.05rem; }

@media (max-width: 768px) {
  .message-input-container { padding: 12px 16px 16px; }
  .action-btn.emoji-btn { width: 30px; height: 30px; font-size: 0.85rem; }
  .action-btn.attach-btn { width: 34px; height: 34px; font-size: 0.85rem; margin-right: 6px; }
  .send-btn { width: 40px; height: 40px; }
  .send-btn i { font-size: 0.95rem; }
  .message-input { font-size: 14px; padding: 10px 44px 10px 0; }
  .reply-bar { margin-bottom: 8px; padding: 7px 9px 7px 10px; }
  .reply-snippet { font-size: 0.75rem; }
}

@media (max-width: 640px) {
  .message-input-container { padding: 10px 14px 14px; }
  .action-btn.emoji-btn { width: 28px; height: 28px; font-size: 0.8rem; right: 5px; bottom: 5px; }
  .action-btn.attach-btn { width: 32px; height: 32px; margin-right: 6px; }
  .send-btn { width: 38px; height: 38px; margin-left: 6px; }
  .send-btn i { font-size: 0.9rem; }
  .input-wrapper { padding: 5px 6px 5px 12px; }
  .message-input { font-size: 14px; padding: 9px 40px 9px 0; min-height: 40px; }
}

@media (max-width: 480px) {
  .message-input-container { padding: 8px 12px 12px; }
  .action-btn.emoji-btn { width: 26px; height: 26px; font-size: 0.75rem; right: 4px; bottom: 4px; }
  .action-btn.attach-btn { width: 30px; height: 30px; margin-right: 5px; }
  .send-btn { width: 36px; height: 36px; margin-left: 5px; }
  .send-btn i { font-size: 0.85rem; }
  .input-wrapper { padding: 4px 5px 4px 10px; }
  .message-input { font-size: 14px; padding: 8px 36px 8px 0; min-height: 38px; }
  .reply-snippet { font-size: 0.7rem; }
  .reply-cancel { width: 22px; height: 22px; }
}

@media (max-width: 360px) {
  .message-input-container { padding: 6px 10px 10px; }
  .action-btn.emoji-btn { width: 24px; height: 24px; font-size: 0.7rem; }
  .action-btn.attach-btn { width: 28px; height: 28px; margin-right: 4px; }
  .send-btn { width: 34px; height: 34px; }
  .message-input { min-height: 36px; padding: 7px 34px 7px 0; }
}
</style>

<template>
  <div class="message-input-container">
    <div v-if="replyTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header d-flex justify-content-between align-items-center">
          <span>ตอบกลับ {{ replyTo.username }}</span>
          <button class="reply-close btn btn-sm btn-light" @click="cancelReply">
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
            rows="1"
            @keydown.enter.prevent="onEnter"
          />

          <button class="action-btn emoji-btn position-absolute" style="right:5px;" @click="toggleEmojiPicker">
            <i class="fas fa-smile" />
          </button>
        </div>

        <button :disabled="!canSend" class="send-btn ml-2" @click="onEnter">
          <i v-if="sending" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-paper-plane" />
        </button>
      </div>
    </div>

    <EmojiPicker
      v-if="showEmojiPicker"
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
    replyTo: Object
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
    onEnter () {
      if (!this.canSend) { return }
      this.sending = true
      this.$emit('send-message', {
        content: this.messageText,
        files: [],
        replyTo: this.replyTo
      })
      this.messageText = ''
      this.sending = false
    },
    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
    },
    addEmoji (emoji) {
      console.log('👉 MessagesInput received:', emoji)
      const textarea = this.$refs.textarea
      if (!textarea) { return }
      const cursorPos = textarea.selectionStart
      const textBefore = this.messageText.substring(0, cursorPos)
      const textAfter = this.messageText.substring(cursorPos)
      const val = typeof emoji === 'string' ? emoji : (emoji.native || '')
      this.messageText = textBefore + val + textAfter
      this.$nextTick(() => {
        textarea.setSelectionRange(cursorPos + val.length, cursorPos + val.length)
        textarea.focus()
      })
    },
    focusInput () {
      this.$refs.textarea.focus()
    },
    cancelReply () {
      this.$emit('cancel-reply')
    }
  }
}
</script>

<style scoped>
.message-input-container {
  position: relative;
  background: #ffffff;
  border-top: 1px solid #e3e8ef;
  border-radius: 0 0 16px 16px;
}

.reply-preview {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e3e8ef;
  padding: 16px 20px;
}

.reply-content {
  position: relative;
  background: white;
  border-left: 4px solid #3b82f6;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 6px;
}

.reply-to {
  font-weight: 600;
  color: #3b82f6;
  flex: 1;
}

.reply-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.reply-close:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.reply-message {
  font-size: 0.9rem;
  color: #475569;
  font-style: italic;
}

.file-preview {
  background: #f8fafc;
  border-bottom: 1px solid #e3e8ef;
  padding: 16px 20px;
}

.file-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.file-item {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  min-width: 200px;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  display: block;
  color: #64748b;
  font-size: 0.8rem;
}

.remove-file {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.input-area {
  padding: 20px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
  background: #ffffff;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #3b82f6;
  transform: scale(1.05);
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
  padding: 12px 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  max-height: 120px;
  overflow-y: auto;
  flex: 1;
}

.message-input:focus {
  box-shadow: none;
  border: none;
  outline: none;
}

.message-input::placeholder {
  color: #94a3b8;
}

.send-btn {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border: none;
  color: #64748b;
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-btn.active:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.message-input::-webkit-scrollbar {
  width: 4px;
}

.message-input::-webkit-scrollbar-track {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .input-area {
    padding: 16px;
  }

  .file-grid {
    gap: 8px;
  }

  .file-info {
    min-width: 160px;
    padding: 10px 12px;
  }

  .file-name {
    font-size: 0.85rem;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    padding: 8px;
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }
}
.file-item {
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

* {
  transition: all 0.2s ease;
}
</style>

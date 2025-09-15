<template>
  <div class="message-input-container">
    <!-- Reply preview -->
    <div v-if="replyTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <i class="fas fa-reply" />
          <span class="reply-to">ตอบกลับ {{ replyTo.username }}</span>
          <button class="reply-close" @click="cancelReply">
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="reply-message">
          {{ truncateText(replyTo.content, 50) }}
        </div>
      </div>
    </div>

    <!-- File preview -->
    <div v-if="selectedFiles.length" class="file-preview">
      <div class="file-grid">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <div v-if="isImageFile(file)" class="image-preview">
            <img :src="getFilePreview(file)" alt="Preview">
            <button class="remove-file" @click="removeFile(index)">
              <i class="fas fa-times" />
            </button>
          </div>
          <div v-else class="file-info">
            <div class="file-icon">
              <i class="fas fa-file" />
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button class="remove-file" @click="removeFile(index)">
              <i class="fas fa-times" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main input area -->
    <div class="input-area">
      <div class="input-wrapper">
        <!-- File attachment button -->
        <button
          v-b-tooltip.top="'แนบไฟล์'"
          class="action-btn attach-btn"
          @click="$refs.fileInput.click()"
        >
          <i class="fas fa-paperclip" />
        </button>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          style="display: none"
          @change="handleFileSelect"
        >

        <!-- Text input -->
        <div class="text-input-wrapper">
          <b-form-textarea
            ref="messageInput"
            v-model="messageText"
            :placeholder="placeholder"
            rows="1"
            max-rows="4"
            no-resize
            class="message-input"
            @keydown="handleKeyDown"
            @input="handleInput"
            @paste="handlePaste"
          />

          <!-- Emoji button -->
          <button
            v-b-tooltip.top="'เลือก Emoji'"
            class="action-btn emoji-btn"
            @click="toggleEmojiPicker"
          >
            <i class="fas fa-smile" />
          </button>
        </div>

        <!-- Send button -->
        <button
          :disabled="!canSend"
          :class="['send-btn', { 'active': canSend }]"
          @click="sendMessage"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-paper-plane" />
        </button>
      </div>
    </div>

    <!-- Emoji Picker -->
    <EmojiPicker
      v-if="showEmojiPicker"
      @emoji-selected="addEmoji"
      @close="showEmojiPicker = false"
    />
  </div>
</template>

<script>
export default {
  name: 'MessageInput',
  components: {
    EmojiPicker: () => import('./EmojiPicker.vue')
  },
  props: {
    replyTo: {
      type: Object,
      default: null
    },
    placeholder: {
      type: String,
      default: 'พิมพ์ข้อความ...'
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024
    },
    allowedFileTypes: {
      type: Array,
      default: () => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    }
  },
  data () {
    return {
      messageText: '',
      selectedFiles: [],
      showEmojiPicker: false,
      sending: false,
      typingTimeout: null,
      isTyping: false
    }
  },
  computed: {
    canSend () {
      return !this.sending && (this.messageText.trim() || this.selectedFiles.length > 0)
    }
  },
  watch: {
    messageText (newVal, oldVal) {
      if (newVal && !this.isTyping) {
        this.startTyping()
      } else if (!newVal && this.isTyping) {
        this.stopTyping()
      }

      this.$nextTick(() => {
        this.autoResize()
      })
    }
  },
  mounted () {
    this.focusInput()
  },
  beforeDestroy () {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }
    this.stopTyping()

    this.selectedFiles.forEach((file) => {
      if (this.isImageFile(file)) {
        URL.revokeObjectURL(this.getFilePreview(file))
      }
    })
  },
  methods: {
    focusInput () {
      this.$nextTick(() => {
        this.$refs.messageInput?.focus()
      })
    },

    autoResize () {
      const textarea = this.$refs.messageInput?.$el
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    },

    handleKeyDown (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }

      if (event.key === 'Escape') {
        this.cancelReply()
        this.showEmojiPicker = false
      }
    },

    handleInput () {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
      }

      this.typingTimeout = setTimeout(() => {
        this.stopTyping()
      }, 1000)
    },

    handlePaste (event) {
      const items = event.clipboardData?.items
      if (!items) { return }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            this.addFile(file)
          }
        }
      }
    },

    handleFileSelect (event) {
      const files = Array.from(event.target.files)
      files.forEach((file) => {
        if (this.validateFile(file)) {
          this.addFile(file)
        }
      })
      event.target.value = ''
    },

    validateFile (file) {
      if (!this.allowedFileTypes.includes(file.type)) {
        this.$bvToast.toast('ประเภทไฟล์ไม่ได้รับอนุญาต', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
        return false
      }

      if (file.size > this.maxFileSize) {
        this.$bvToast.toast(`ไฟล์ใหญ่เกินไป (สูงสุด ${this.formatFileSize(this.maxFileSize)})`, {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
        return false
      }

      return true
    },

    addFile (file) {
      const exists = this.selectedFiles.some(f =>
        f.name === file.name && f.size === file.size
      )
      if (exists) { return }

      if (this.selectedFiles.length >= 5) {
        this.$bvToast.toast('สามารถแนบไฟล์ได้สูงสุด 5 ไฟล์', {
          title: 'ข้อจำกัด',
          variant: 'warning',
          solid: true
        })
        return
      }

      this.selectedFiles.push(file)
    },

    removeFile (index) {
      this.selectedFiles.splice(index, 1)
    },

    isImageFile (file) {
      return file.type.startsWith('image/')
    },

    getFilePreview (file) {
      if (this.isImageFile(file)) {
        return URL.createObjectURL(file)
      }
      return null
    },

    formatFileSize (bytes) {
      if (bytes === 0) { return '0 B' }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    truncateText (text, maxLength) {
      if (text.length <= maxLength) { return text }
      return text.substring(0, maxLength) + '...'
    },

    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
    },

    addEmoji (emoji) {
      const cursorPos = this.$refs.messageInput.$el.selectionStart
      const textBefore = this.messageText.substring(0, cursorPos)
      const textAfter = this.messageText.substring(cursorPos)
      this.messageText = textBefore + emoji + textAfter

      this.$nextTick(() => {
        const newPos = cursorPos + emoji.length
        this.$refs.messageInput.$el.setSelectionRange(newPos, newPos)
        this.$refs.messageInput.$el.focus()
      })
    },

    startTyping () {
      if (!this.isTyping) {
        this.isTyping = true
        this.$emit('typing-start')
      }
    },

    stopTyping () {
      if (this.isTyping) {
        this.isTyping = false
        this.$emit('typing-stop')
      }
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
        this.typingTimeout = null
      }
    },

    async sendMessage () {
      if (!this.canSend) { return }

      this.sending = true
      this.stopTyping()

      try {
        const messageData = {
          content: this.messageText.trim(),
          files: this.selectedFiles,
          replyTo: this.replyTo?._id || null,
          type: this.selectedFiles.length > 0 ? 'file' : 'text'
        }

        await this.$emit('send-message', messageData)

        this.messageText = ''
        this.selectedFiles = []
        this.cancelReply()

        this.$nextTick(() => {
          this.autoResize()
        })
      } catch (error) {
        console.error('Error sending message:', error)
        this.$bvToast.toast('ไม่สามารถส่งข้อความได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.sending = false
        this.focusInput()
      }
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

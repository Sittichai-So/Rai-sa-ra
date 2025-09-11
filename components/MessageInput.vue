<template>
  <div class="message-input-container">
    <!-- Reply preview -->
    <div v-if="replyTo" class="reply-preview">
      <div class="reply-content">
        <div class="reply-header">
          <i class="fas fa-reply mr-1" />
          <span class="reply-to">ตอบกลับ {{ replyTo.username }}</span>
          <b-button
            size="sm"
            variant="link"
            class="reply-close"
            @click="cancelReply"
          >
            <i class="fas fa-times" />
          </b-button>
        </div>
        <div class="reply-message">
          {{ truncateText(replyTo.content, 50) }}
        </div>
      </div>
    </div>

    <!-- File preview -->
    <div v-if="selectedFiles.length" class="file-preview">
      <div class="file-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <div v-if="isImageFile(file)" class="image-preview">
            <img :src="getFilePreview(file)" alt="Preview">
            <b-button
              size="sm"
              variant="danger"
              class="remove-file"
              @click="removeFile(index)"
            >
              <i class="fas fa-times" />
            </b-button>
          </div>
          <div v-else class="file-info">
            <i class="fas fa-file mr-2" />
            <span class="file-name">{{ file.name }}</span>
            <small class="file-size">({{ formatFileSize(file.size) }})</small>
            <b-button
              size="sm"
              variant="danger"
              class="remove-file ml-2"
              @click="removeFile(index)"
            >
              <i class="fas fa-times" />
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main input area -->
    <div class="input-area">
      <div class="input-wrapper">
        <!-- File attachment button -->
        <b-button
          v-b-tooltip.top="'แนบไฟล์'"
          variant="link"
          size="sm"
          class="attach-btn"
          @click="$refs.fileInput.click()"
        >
          <i class="fas fa-paperclip" />
        </b-button>

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
            max-rows="5"
            no-resize
            class="message-input"
            @keydown="handleKeyDown"
            @input="handleInput"
            @paste="handlePaste"
          />

          <!-- Emoji button -->
          <b-button
            v-b-tooltip.top="'เลือก Emoji'"
            variant="link"
            size="sm"
            class="emoji-btn"
            @click="toggleEmojiPicker"
          >
            <i class="fas fa-smile" />
          </b-button>
        </div>

        <!-- Send button -->
        <b-button
          :disabled="!canSend"
          variant="warning"
          size="sm"
          class="send-btn"
          @click="sendMessage"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-paper-plane" />
        </b-button>
      </div>
    </div>

    <!-- Emoji Picker -->
    <EmojiPicker
      v-if="showEmojiPicker"
      @emoji-selected="addEmoji"
      @close="showEmojiPicker = false"
    />

    <!-- Voice recording (future feature) -->
    <div v-if="isRecording" class="recording-overlay">
      <div class="recording-content">
        <div class="recording-animation">
          <div class="pulse-ring" />
          <div class="recording-dot" />
        </div>
        <div class="recording-text">
          <div>กำลังบันทึกเสียง...</div>
          <div class="recording-time">
            {{ recordingTime }}
          </div>
        </div>
        <div class="recording-controls">
          <b-button
            variant="danger"
            size="sm"
            @click="cancelRecording"
          >
            ยกเลิก
          </b-button>
          <b-button
            variant="success"
            size="sm"
            @click="stopRecording"
          >
            ส่ง
          </b-button>
        </div>
      </div>
    </div>
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
      isRecording: false,
      recordingTime: '00:00',
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
    },

    startRecording () {
      this.isRecording = true
    },

    stopRecording () {
      this.isRecording = false
    },

    cancelRecording () {
      this.isRecording = false
    }
  }
}
</script>

<style scoped>
.message-input-container {
  position: relative;
  background: white;
  border-top: 1px solid #e9ecef;
}

.reply-preview {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 12px 16px;
}

.reply-content {
  position: relative;
  background: white;
  border-left: 4px solid #ffc107;
  padding: 8px 12px;
  border-radius: 4px;
}

.reply-header {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.reply-to {
  font-weight: 600;
  margin-right: auto;
}

.reply-close {
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reply-message {
  font-size: 0.9rem;
  color: #495057;
  font-style: italic;
}

.file-preview {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 12px 16px;
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-item {
  position: relative;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-file {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.file-info {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  max-width: 250px;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.file-size {
  color: #6c757d;
  margin-right: 8px;
}

.input-area {
  padding: 16px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 8px;
  border: 1px solid #dee2e6;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}

.attach-btn {
  color: #6c757d;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.attach-btn:hover {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}

.text-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.message-input {
  border: none;
  background: transparent;
  resize: none;
  padding: 8px 12px;
  line-height: 1.4;
  max-height: 120px;
  overflow-y: auto;
}

.message-input:focus {
  box-shadow: none;
  border: none;
}

.emoji-btn {
  color: #6c757d;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.emoji-btn:hover {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: all 0.2s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.recording-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 300px;
}

.recording-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #dc3545;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.recording-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: #dc3545;
  border-radius: 50%;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.recording-text {
  margin-bottom: 24px;
}

.recording-time {
  font-size: 1.2rem;
  font-weight: 600;
  color: #dc3545;
  font-family: monospace;
}

.recording-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .input-area {
    padding: 12px;
  }

  .file-list {
    max-width: 100%;
    overflow-x: auto;
  }

  .file-info {
    max-width: 200px;
  }

  .recording-content {
    margin: 16px;
    padding: 24px;
  }
}

.file-list::-webkit-scrollbar {
  height: 4px;
}

.file-list::-webkit-scrollbar-track {
  background: transparent;
}

.file-list::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}
</style>

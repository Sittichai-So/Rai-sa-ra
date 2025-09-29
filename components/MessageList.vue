<template>
  <div class="message-list-container">
    <div
      ref="messageList"
      class="message-list"
      @scroll="handleScroll"
    >
      <div v-if="loadingMore" class="text-center py-3">
        <b-spinner small class="mr-2" />
        <span class="text-muted">กำลังโหลดข้อความ...</span>
      </div>

      <div
        v-for="(group, date) in groupedMessages"
        :key="date"
        class="message-group"
      >
        <div class="date-separator text-center my-3">
          <small class="bg-light text-muted px-2 py-1 rounded">{{ formatDate(date) }}</small>
        </div>

        <div
          v-for="(message, index) in group"
          :key="message._id || (message.createdAt + '-' + index)"
          :class="[
            'message-wrapper',
            { 'own-message': message.userId === currentUserId }
          ]"
        >
          <div class="message-bubble-container d-flex align-items-start">
            <b-avatar
              v-if="message.userId !== currentUserId"
              :text="getInitials(message.username)"
              :src="message.avatar"
              size="32"
              class="message-avatar mr-2"
              variant="secondary"
            />

            <div class="message-main">
              <div
                :class="[
                  'message-bubble',
                  message.userId === currentUserId ? 'own' : 'other'
                ]"
              >
                <div v-if="message.userId !== currentUserId" class="sender-name">
                  {{ message.username }}
                </div>

                <div class="message-content">
                  <div v-if="message.type === 'text'" class="message-text">
                    {{ message.content }}
                  </div>

                  <div v-else-if="message.type === 'image'" class="message-image">
                    <img
                      :src="message.fileUrl"
                      :alt="message.content"
                      class="img-fluid rounded"
                      @click="showImageModal(message.fileUrl)"
                    >
                    <div v-if="message.content" class="image-caption mt-1">
                      {{ message.content }}
                    </div>
                  </div>

                  <div v-else-if="message.type === 'file'" class="message-file">
                    <div class="file-info d-flex align-items-center">
                      <i class="fas fa-file mr-2" />
                      <div>
                        <div class="file-name">
                          {{ message.fileName }}
                        </div>
                        <small class="text-muted">{{ formatFileSize(message.fileSize) }}</small>
                      </div>
                      <b-button
                        size="sm"
                        variant="outline-primary"
                        class="ml-auto"
                        @click="downloadFile(message.fileUrl, message.fileName)"
                      >
                        <i class="fas fa-download" />
                      </b-button>
                    </div>
                  </div>
                </div>

                <div v-if="message.reactions && message.reactions.length" class="message-reactions">
                  <b-button
                    v-for="reaction in getUniqueReactions(message.reactions)"
                    :key="reaction.emoji"
                    size="sm"
                    variant="light"
                    class="reaction-btn"
                    @click="toggleReaction(message._id, reaction.emoji)"
                  >
                    {{ reaction.emoji }} {{ reaction.count }}
                  </b-button>
                </div>

                <div class="message-meta d-flex align-items-center justify-content-between">
                  <small class="text-muted">
                    {{ formatMessageTime(message.createdAt) }}
                  </small>
                  <span v-if="message.userId === currentUserId" class="message-status ml-1">
                    <i
                      :class="getStatusIcon(message.status)"
                      :title="getStatusTitle(message.status)"
                    />
                  </span>
                </div>
              </div>

              <div class="message-actions ml-1">
                <b-dropdown
                  variant="link"
                  size="sm"
                  no-caret
                  right
                  class="message-menu"
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v" />
                  </template>
                  <b-dropdown-item @click="addReaction(message._id)">
                    <i class="fas fa-smile mr-2" /> เพิ่มรีแอคชัน
                  </b-dropdown-item>
                  <b-dropdown-item @click="replyToMessage(message)">
                    <i class="fas fa-reply mr-2" /> ตอบกลับ
                  </b-dropdown-item>
                  <b-dropdown-divider v-if="message.userId === currentUserId" />
                  <b-dropdown-item
                    v-if="message.userId === currentUserId"
                    @click="editMessage(message)"
                  >
                    <i class="fas fa-edit mr-2" /> แก้ไข
                  </b-dropdown-item>
                  <b-dropdown-item
                    v-if="message.userId === currentUserId"
                    variant="danger"
                    @click="deleteMessage(message._id)"
                  >
                    <i class="fas fa-trash mr-2" /> ลบ
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="typingUsers.length" class="typing-container">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span />
            <span />
            <span />
          </div>
          <p class="typing-text">
            {{ getTypingText() }}
          </p>
        </div>
      </div>
    </div>

    <b-button
      v-if="!isAtBottom"
      variant="warning"
      size="sm"
      class="scroll-bottom-btn"
      @click="scrollToBottom"
    >
      <i class="fas fa-arrow-down" />
      <b-badge v-if="newMessagesCount" variant="danger" class="ml-1">
        {{ newMessagesCount }}
      </b-badge>
    </b-button>

    <b-modal
      id="image-modal"
      v-model="showImageModalFlag"
      size="lg"
      centered
      hide-footer
      body-class="p-0"
    >
      <img
        v-if="selectedImage"
        :src="selectedImage"
        alt="Image"
        class="img-fluid w-100"
      >
    </b-modal>
  </div>
</template>

<script>
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: String,
      required: true
    },
    typingUsers: {
      type: Array,
      default: () => []
    },
    loadingMore: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isAtBottom: true,
      newMessagesCount: 0,
      showImageModalFlag: false,
      selectedImage: null
    }
  },
  computed: {
    groupedMessages () {
      if (!Array.isArray(this.messages)) {
        return {}
      }

      const grouped = {}
      this.messages.forEach((message) => {
        try {
          let dateString = message.createdAt
          if (!dateString) {
            dateString = new Date().toISOString()
          }

          let parsedDate
          try {
            parsedDate = parseISO(dateString)
          } catch (parseError) {
            parsedDate = new Date()
          }

          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date()
          }

          const date = format(parsedDate, 'yyyy-MM-dd')
          if (!grouped[date]) {
            grouped[date] = []
          }
          grouped[date].push(message)
        } catch (error) {
          console.error('Error processing message date:', error, message)
        }
      })
      return grouped
    }
  },
  watch: {
    messages: {
      handler () {
        this.$nextTick(() => {
          if (this.isAtBottom) {
            this.scrollToBottom()
          } else {
            this.newMessagesCount++
          }
        })
      },
      deep: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })
  },
  methods: {
    handleScroll () {
      const element = this.$refs.messageList
      if (!element) { return }

      try {
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100

        if (isAtBottom && !this.isAtBottom) {
          this.isAtBottom = true
          this.newMessagesCount = 0
        } else if (!isAtBottom) {
          this.isAtBottom = false
        }
        if (element.scrollTop === 0 && !this.loadingMore) {
          this.$emit('load-more')
        }
      } catch (error) {
        console.error('Error in handleScroll:', error)
      }
    },

    scrollToBottom () {
      this.$nextTick(() => {
        try {
          const element = this.$refs.messageList
          if (element && typeof element.scrollHeight === 'number') {
            element.scrollTop = element.scrollHeight
            this.isAtBottom = true
            this.newMessagesCount = 0
          }
        } catch (error) {
          console.error('Error in scrollToBottom:', error)
        }
      })
    },

    formatDate (dateString) {
      try {
        const date = parseISO(dateString)
        if (isNaN(date.getTime())) {
          return 'วันนี้'
        }

        if (isToday(date)) { return 'วันนี้' }
        if (isYesterday(date)) { return 'เมื่อวาน' }
        return format(date, 'dd MMMM yyyy', { locale: th })
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'วันนี้'
      }
    },

    formatMessageTime (dateString) {
      try {
        const date = parseISO(dateString)
        if (isNaN(date.getTime())) {
          return format(new Date(), 'HH:mm')
        }
        return format(date, 'HH:mm')
      } catch (error) {
        console.error('Error formatting time:', error)
        return format(new Date(), 'HH:mm')
      }
    },

    getInitials (name) {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
    },

    getUniqueReactions (reactions) {
      if (!Array.isArray(reactions)) { return [] }

      const grouped = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = { emoji: reaction.emoji, count: 0 }
        }
        acc[reaction.emoji].count++
        return acc
      }, {})
      return Object.values(grouped)
    },

    getStatusIcon (status) {
      switch (status) {
        case 'sent': return 'fas fa-check text-muted'
        case 'delivered': return 'fas fa-check-double text-muted'
        case 'read': return 'fas fa-check-double text-primary'
        default: return 'fas fa-clock text-muted'
      }
    },

    getStatusTitle (status) {
      switch (status) {
        case 'sent': return 'ส่งแล้ว'
        case 'delivered': return 'ส่งถึงแล้ว'
        case 'read': return 'อ่านแล้ว'
        default: return 'กำลังส่ง'
      }
    },

    getTypingText () {
      if (this.typingUsers.length === 1) {
        return `${this.typingUsers[0]} กำลังพิมพ์...`
      } else if (this.typingUsers.length === 2) {
        return `${this.typingUsers[0]} และ ${this.typingUsers[1]} กำลังพิมพ์...`
      } else {
        return 'หลายคนกำลังพิมพ์...'
      }
    },

    formatFileSize (bytes) {
      if (!bytes || bytes === 0) { return '0 B' }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    showImageModal (imageUrl) {
      this.selectedImage = imageUrl
      this.showImageModalFlag = true
    },

    downloadFile (url, filename) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
    },

    toggleReaction (messageId, emoji) {
      this.$emit('toggle-reaction', { messageId, emoji })
    },

    addReaction (messageId) {
      this.$emit('add-reaction', messageId)
    },

    replyToMessage (message) {
      this.$emit('reply-to', message)
    },

    editMessage (message) {
      this.$emit('edit-message', message)
    },

    deleteMessage (messageId) {
      this.$emit('delete-message', messageId)
    }
  }
}
</script>

<style scoped>
.message-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 16px;
  min-height: 0;
  background: transparent;
  position: relative;
}

.message-list::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.message-bubble-container {
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  margin-bottom: 4px;
  animation: slideInMessage 0.3s ease-out;
}

@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-main {
  display: flex;
  align-items: flex-start;
  max-width: calc(100% - 48px);
  position: relative;
}

.message-bubble {
  position: relative;
  max-width: 400px;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.message-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: 0;
}

.message-bubble > * {
  position: relative;
  z-index: 1;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.16);
}

.message-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(5px);
}

.message-wrapper:hover .message-actions {
  opacity: 1;
  transform: translateX(0);
}

.message-group {
  margin-bottom: 24px;
}

.date-separator {
  position: sticky;
  top: 10px;
  z-index: 10;
  margin: 20px 0;
}

.date-separator small {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 6px 16px;
  border-radius: 16px;
  font-weight: 500;
  color: #6c757d;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.message-wrapper {
  margin-bottom: 12px;
  position: relative;
}

.own-message .message-bubble-container {
  justify-content: flex-end;
}

.own-message .message-main {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.message-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.message-bubble.own {
  background: linear-gradient(135deg, #667eea 0%, #e8d1ff 100%);
  color: white;
  border-bottom-right-radius: 8px;
  margin-left: auto;
}

.message-bubble.other {
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  border-bottom-left-radius: 8px;
  margin-right: auto;
}

.sender-name {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message-bubble.own .sender-name {
  color: rgba(255, 255, 255, 0.8);
}

.message-content {
  margin-bottom: 8px;
}

.message-text {
  line-height: 1.5;
  word-break: break-word;
  font-size: 14px;
  font-weight: 400;
}

.message-image {
  position: relative;
}

.message-image img {
  max-width: 280px;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.message-image img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-caption {
  font-size: 13px;
  color: #6c757d;
  margin-top: 8px;
  font-style: italic;
}

.message-file {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.message-file:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.file-info {
  min-width: 220px;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  color: inherit;
  margin-bottom: 4px;
}

.message-reactions {
  display: flex;
  gap: 6px;
  margin: 12px 0 8px 0;
  flex-wrap: wrap;
}

.reaction-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  font-weight: 500;
}

.reaction-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.8;
  font-weight: 500;
}

.message-bubble.other .message-meta {
  justify-content: flex-start;
}

.message-status {
  opacity: 0.8;
  margin-left: 4px;
  transition: opacity 0.2s ease;
}

.own-message .message-actions {
  order: -1;
  margin-right: 8px;
  margin-left: 0;
}

.message-menu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.typing-container {
  padding: 12px 20px;
  animation: slideInMessage 0.3s ease-out;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 20px;
  max-width: fit-content;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.3);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow:
    0 8px 24px rgba(102, 126, 234, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  color: white;
}

.scroll-bottom-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 12px 32px rgba(102, 126, 234, 0.4),
    0 6px 16px rgba(0, 0, 0, 0.2);
}

.scroll-bottom-btn:active {
  transform: translateY(0) scale(1);
}

.typing-text {
  color: #667eea;
  font-style: italic;
  font-size: 12px;
  margin: 0;
  font-weight: 500;
}

.message-list::-webkit-scrollbar {
  width: 8px;
}

.message-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.message-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  background-clip: content-box;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loading-shimmer {
  position: relative;
  overflow: hidden;
}

.loading-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@media (max-width: 768px) {
  .message-list-container {
    height: calc(100vh - 100px);
  }

  .message-list {
    padding: 16px 12px;
  }

  .message-main {
    max-width: calc(100% - 40px);
  }

  .message-bubble {
    max-width: 280px;
    padding: 10px 14px;
  }

  .message-image img {
    max-width: 220px;
    max-height: 180px;
  }

  .scroll-bottom-btn {
    width: 48px;
    height: 48px;
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .message-bubble {
    max-width: 240px;
    padding: 8px 12px;
  }

  .message-list {
    padding: 12px 8px;
  }
}

@media (prefers-color-scheme: dark) {
  .message-list-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .message-bubble.other {
    background: rgba(30, 41, 59, 0.9);
    color: #e2e8f0;
  }

  .date-separator small {
    background: rgba(30, 41, 59, 0.9);
    color: #94a3b8;
  }

  .typing-bubble {
    background: rgba(30, 41, 59, 0.9);
  }

  .typing-text {
    color: #94a3b8;
  }

  .sender-name {
    color: rgba(148, 163, 184, 0.8);
  }
}

.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-enter-to {
  opacity: 1;
  transform: translateY(0);
}

@keyframes reactionPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.reaction-btn.active {
  animation: reactionPulse 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>

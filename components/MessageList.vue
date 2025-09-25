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
}

.message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  min-height: 0;
}

.message-bubble-container {
  display: flex;
  align-items: flex-start;
}

.message-main {
  display: flex;
  align-items: flex-start;
  max-width: calc(100% - 48px);
}

.message-bubble {
  position: relative;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message-actions {
  display: flex;
  align-items: center;
  margin-left: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.message-group {
  margin-bottom: 16px;
}

.date-separator {
  position: sticky;
  top: 0;
  z-index: 1;
}

.date-separator small {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border: 1px solid #e9ecef;
}

.message-wrapper {
  margin-bottom: 8px;
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
}

.message-bubble.own {
  background: #81beff;
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bubble.other {
  background: #f8f9fa;
  color: #212529;
  border-bottom-left-radius: 6px;
}

.sender-name {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
}

.message-content {
  margin-bottom: 4px;
}

.message-text {
  line-height: 1.4;
  word-break: break-word;
}

.message-image img {
  max-width: 250px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image img:hover {
  transform: scale(1.02);
}

.image-caption {
  font-size: 14px;
  color: #6c757d;
}

.message-file {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.file-info {
  min-width: 200px;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
}

.message-reactions {
  display: flex;
  gap: 4px;
  margin: 8px 0 4px 0;
  flex-wrap: wrap;
}

.reaction-btn {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
}

.message-bubble.other .message-meta {
  justify-content: flex-start;
}

.message-status {
  opacity: 0.7;
}

.own-message .message-actions {
  order: -1;
  margin-right: 4px;
  margin-left: 0;
}

.message-menu {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
}

.typing-container {
  padding: 8px 16px;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 18px;
  max-width: fit-content;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-text {
  color: #6c757d;
  font-style: italic;
  font-size: 11px;
  margin: 0;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (max-width: 768px) {
  .message-list-container {
    height: calc(100vh - 100px);
  }

  .message-main {
    max-width: calc(100% - 40px);
  }

  .message-image img {
    max-width: 200px;
  }
}
</style>

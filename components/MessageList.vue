<template>
  <div class="message-list-container">
    <div
      ref="messageList"
      class="message-list"
      @scroll="handleScroll"
    >
      <!-- Loading more messages -->
      <div v-if="loadingMore" class="text-center py-3">
        <b-spinner small class="mr-2" />
        <span class="text-muted">กำลังโหลดข้อความ...</span>
      </div>

      <!-- Date separator -->
      <div
        v-for="(group, date) in groupedMessages"
        :key="date"
        class="message-group"
      >
        <div class="date-separator text-center my-3">
          <small class="bg-light text-muted px-2 py-1 rounded">{{ formatDate(date) }}</small>
        </div>

        <!-- Messages for this date -->
        <div
          v-for="message in group"
          :key="message._id"
          :class="[
            'message-wrapper',
            { 'own-message': message.userId === currentUserId }
          ]"
        >
          <div class="message-bubble-container">
            <!-- Avatar for other users -->
            <b-avatar
              v-if="message.userId !== currentUserId"
              :text="getInitials(message.username)"
              :src="message.avatar"
              size="32"
              class="message-avatar"
              variant="secondary"
            />

            <div
              :class="[
                'message-bubble',
                message.userId === currentUserId ? 'own' : 'other'
              ]"
            >
              <!-- Sender name (for other users) -->
              <div
                v-if="message.userId !== currentUserId"
                class="sender-name"
              >
                {{ message.username }}
              </div>

              <!-- Message content -->
              <div class="message-content">
                <!-- Text message -->
                <div v-if="message.type === 'text'" class="message-text">
                  {{ message.content }}
                </div>

                <!-- Image message -->
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

                <!-- File message -->
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

              <!-- Message reactions -->
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

              <!-- Message time & status -->
              <div class="message-meta">
                <small class="text-muted">
                  {{ formatMessageTime(message.createdAt) }}
                </small>
                <span
                  v-if="message.userId === currentUserId"
                  class="message-status ml-1"
                >
                  <i
                    :class="getStatusIcon(message.status)"
                    :title="getStatusTitle(message.status)"
                  />
                </span>
              </div>
            </div>

            <!-- Message actions -->
            <div class="message-actions">
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

      <!-- Typing indicators -->
      <div v-if="typingUsers.length" class="typing-container">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span />
            <span />
            <span />
          </div>
          <small class="typing-text">
            {{ getTypingText() }}
          </small>
        </div>
      </div>
    </div>

    <!-- Scroll to bottom button -->
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

    <!-- Image modal -->
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
      const grouped = {}
      this.messages.forEach((message) => {
        const date = format(parseISO(message.createdAt), 'yyyy-MM-dd')
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(message)
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
    this.scrollToBottom()
  },
  methods: {
    handleScroll () {
      const element = this.$refs.messageList
      const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100

      if (isAtBottom && !this.isAtBottom) {
        this.isAtBottom = true
        this.newMessagesCount = 0
      } else if (!isAtBottom) {
        this.isAtBottom = false
      }

      // Load more messages when scrolled to top
      if (element.scrollTop === 0 && !this.loadingMore) {
        this.$emit('load-more')
      }
    },

    scrollToBottom () {
      this.$nextTick(() => {
        const element = this.$refs.messageList
        element.scrollTop = element.scrollHeight
        this.isAtBottom = true
        this.newMessagesCount = 0
      })
    },

    formatDate (dateString) {
      const date = parseISO(dateString)
      if (isToday(date)) { return 'วันนี้' }
      if (isYesterday(date)) { return 'เมื่อวาน' }
      return format(date, 'dd MMMM yyyy', { locale: th })
    },

    formatMessageTime (dateString) {
      return format(parseISO(dateString), 'HH:mm')
    },

    getInitials (name) {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
    },

    getUniqueReactions (reactions) {
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
      if (bytes === 0) { return '0 B' }
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
  position: relative;
  height: 100%;
}

.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.message-group {
  margin-bottom: 16px;
}

.date-separator {
  position: relative;
  margin: 20px 0;
}

.date-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
  z-index: 0;
}

.date-separator small {
  position: relative;
  z-index: 1;
}

.message-wrapper {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-end;
}

.message-wrapper.own-message {
  justify-content: flex-end;
}

.message-bubble-container {
  display: flex;
  align-items: flex-end;
  max-width: 70%;
  position: relative;
}

.own-message .message-bubble-container {
  flex-direction: row-reverse;
}

.message-avatar {
  margin-right: 8px;
  flex-shrink: 0;
}

.own-message .message-avatar {
  margin-right: 0;
  margin-left: 8px;
}

.message-bubble {
  background: white;
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
  word-wrap: break-word;
}

.message-bubble.own {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-right: 8px;
}

.message-bubble.other {
  background: white;
  margin-left: 8px;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
}

.message-content {
  margin-bottom: 4px;
}

.message-text {
  line-height: 1.4;
}

.message-image img {
  max-width: 200px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image img:hover {
  transform: scale(1.02);
}

.image-caption {
  font-size: 0.9rem;
  opacity: 0.9;
}

.message-file {
  min-width: 200px;
}

.file-info {
  padding: 8px;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.message-reactions {
  margin-top: 6px;
}

.reaction-btn {
  font-size: 0.8rem;
  margin-right: 4px;
  border-radius: 12px;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.7rem;
}

.message-bubble.other .message-meta {
  justify-content: flex-start;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.message-menu {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: -30px;
}

.own-message .message-menu {
  left: -30px;
  right: auto;
}

.typing-container {
  display: flex;
  align-items: flex-end;
  margin-top: 12px;
}

.typing-bubble {
  background: white;
  border-radius: 18px;
  padding: 12px 16px;
  margin-left: 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.typing-dots {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.typing-dots span {
  height: 6px;
  width: 6px;
  background: #6c757d;
  border-radius: 50%;
  margin-right: 4px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
  margin-right: 0;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.typing-text {
  color: #6c757d;
  font-size: 0.75rem;
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}
</style>

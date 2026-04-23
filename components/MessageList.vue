// components/MessageList.vue
<template>
  <div class="message-list-container" :data-theme="chatTheme">
    <div ref="messageList" class="message-list" @scroll="handleScroll">
      <div v-if="loadingMore" class="text-center py-3">
        <b-spinner small class="mr-2" />
        <span class="text-muted">กำลังโหลดข้อความ...</span>
      </div>

      <div v-for="(group, date) in groupedMessages" :key="date" class="message-group">
        <div class="date-separator text-center my-3">
          <small class="bg-light text-muted px-2 py-1 rounded">{{ formatDate(date) }}</small>
        </div>

        <div
          v-for="(message, index) in group"
          :key="message._id || (message.createdAt + '-' + index)"
          :class="['message-wrapper', { 'own-message': message.userId === currentUserId }]"
          :data-message-id="message._id"
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

            <div class="message-main" @contextmenu.prevent="showContextMenu($event, message)">
              <div v-if="message.replyTo" class="reply-preview-outside" @click="scrollToMessage(message.replyTo.messageId)">
                <div class="reply-line" />
                <div class="reply-info">
                  <div class="reply-username-outside">
                    {{ message.replyTo.username }}
                  </div>
                  <div class="reply-text-outside">
                    {{ truncateText(message.replyTo.content, 60) }}
                  </div>
                </div>
              </div>

              <div :class="['message-bubble', message.userId === currentUserId ? 'own' : 'other']">
                <div v-if="message.userId !== currentUserId" class="sender-name">
                  {{ message.username }}
                </div>

                <div class="message-content">
                  <div v-if="message.type === 'text'" class="message-text">
                    {{ message.content }}
                  </div>

                  <div v-else-if="message.type === 'image'" class="message-image">
                    <img :src="message.fileUrl" :alt="message.content" class="img-fluid rounded" @click="showImageModal(message.fileUrl)">
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
                      <b-button size="sm" variant="outline-primary" class="ml-auto" @click="downloadFile(message.fileUrl, message.fileName)">
                        <i class="fas fa-download" />
                      </b-button>
                    </div>
                  </div>
                </div>

                <div class="message-meta">
                  <small class="text-muted">{{ formatMessageTime(message.createdAt) }}</small>
                  <span v-if="message.userId === currentUserId" class="message-status">
                    <i :class="getStatusIcon(message.status)" :title="getStatusTitle(message.status)" />
                  </span>
                </div>
              </div>

              <div v-if="message.reactions && message.reactions.length" class="message-reactions-outside">
                <button
                  v-for="reaction in getUniqueReactions(message.reactions)"
                  :key="reaction.emoji"
                  class="reaction-pill"
                  @click="toggleReaction(message._id, reaction.emoji)"
                >
                  <span class="reaction-emoji">{{ reaction.emoji }}</span>
                  <span class="reaction-count">{{ reaction.count }}</span>
                </button>
              </div>

              <div class="quick-actions">
                <button class="quick-action-btn" title="React" @click="showReactionPicker(message._id)">
                  <i class="far fa-smile" />
                </button>
                <button class="quick-action-btn" title="Reply" @click="replyToMessage(message)">
                  <i class="fas fa-reply" />
                </button>
                <button class="quick-action-btn" title="More" @click="showContextMenu($event, message)">
                  <i class="fas fa-ellipsis-h" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="typingUsers.length" class="typing-container">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span /><span /><span />
          </div>
          <p class="typing-text">
            {{ getTypingText() }}
          </p>
        </div>
      </div>
    </div>

    <button v-if="!isAtBottom" class="scroll-bottom-btn" @click="scrollToBottom">
      <i class="fas fa-arrow-down" />
      <span v-if="newMessagesCount" class="new-messages-badge">
        {{ newMessagesCount }}
      </span>
    </button>

    <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click="hideContextMenu">
      <button class="context-menu-item" @click="showReactionPicker(contextMenu.message._id)">
        <i class="far fa-smile" /> เพิ่มรีแอคชัน
      </button>
      <button class="context-menu-item" @click="replyToMessage(contextMenu.message)">
        <i class="fas fa-reply" /> ตอบกลับ
      </button>
      <button class="context-menu-item" @click="copyMessage(contextMenu.message)">
        <i class="far fa-copy" /> คัดลอก
      </button>
      <div v-if="contextMenu.message.userId === currentUserId" class="context-menu-divider" />
      <button v-if="contextMenu.message.userId === currentUserId" class="context-menu-item" @click="editMessage(contextMenu.message)">
        <i class="fas fa-edit" /> แก้ไข
      </button>
      <button v-if="contextMenu.message.userId === currentUserId" class="context-menu-item danger" @click="deleteMessage(contextMenu.message._id)">
        <i class="fas fa-trash" /> ลบ
      </button>
    </div>

    <b-modal
      id="image-modal"
      v-model="showImageModalFlag"
      size="lg"
      centered
      hide-footer
      body-class="p-0"
    >
      <img v-if="selectedImage" :src="selectedImage" alt="Image" class="img-fluid w-100">
    </b-modal>

    <b-modal
      id="reaction-picker"
      v-model="showReactionPickerModal"
      hide-header
      hide-footer
      centered
      modal-class="reaction-picker-modal"
      body-class="reaction-picker-body"
      size="sm"
    >
      <div class="reaction-picker-container">
        <button
          v-for="emoji in reactionEmojis"
          :key="emoji"
          class="reaction-emoji-btn"
          @click="addReactionEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

export default {
  name: 'MessageList',
  props: {
    messages: { type: Array, default: () => [] },
    currentUserId: { type: String, required: true },
    typingUsers: { type: Array, default: () => [] },
    loadingMore: { type: Boolean, default: false },
    chatTheme: { type: String, default: 'default' }
  },
  data () {
    return {
      isAtBottom: true,
      newMessagesCount: 0,
      showImageModalFlag: false,
      selectedImage: null,
      showReactionPickerModal: false,
      selectedMessageId: null,
      reactionEmojis: ['❤️', '👍', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯', '✨', '💪'],
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        message: null
      }
    }
  },
  computed: {
    groupedMessages () {
      if (!Array.isArray(this.messages)) { return {} }
      const grouped = {}
      this.messages.forEach((message) => {
        try {
          const dateString = message.createdAt || new Date().toISOString()
          let parsedDate
          try {
            parsedDate = parseISO(dateString)
          } catch {
            parsedDate = new Date()
          }
          if (isNaN(parsedDate.getTime())) { parsedDate = new Date() }
          const date = format(parsedDate, 'yyyy-MM-dd')
          if (!grouped[date]) { grouped[date] = [] }
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
          // Animate new messages
          const newMessages = document.querySelectorAll('.message-wrapper:not(.animated)')
          this.$anime({
            targets: newMessages,
            opacity: [0, 1],
            translateX: [20, 0],
            duration: 300,
            easing: 'easeOutQuad',
            delay: this.$anime.stagger(50)
          })
          newMessages.forEach(el => el.classList.add('animated'))
        })
      },
      deep: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => this.scrollToBottom(), 100)
      // Animate message list entrance
      this.$anime({
        targets: '.message-list',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutQuad'
      })
    })
    document.addEventListener('click', this.hideContextMenu)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.hideContextMenu)
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
        }
      })
    },
    scrollToMessage (messageId) {
      // Implement scroll to specific message
    },
    formatDate (dateString) {
      try {
        const date = parseISO(dateString)
        if (isNaN(date.getTime())) { return 'วันนี้' }
        if (isToday(date)) { return 'วันนี้' }
        if (isYesterday(date)) { return 'เมื่อวาน' }
        return format(date, 'dd MMMM yyyy', { locale: th })
      } catch {
        return 'วันนี้'
      }
    },
    formatMessageTime (dateString) {
      try {
        const date = parseISO(dateString)
        return isNaN(date.getTime()) ? format(new Date(), 'HH:mm') : format(date, 'HH:mm')
      } catch {
        return format(new Date(), 'HH:mm')
      }
    },
    getInitials (name) {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
    },
    getUniqueReactions (reactions) {
      if (!Array.isArray(reactions)) { return [] }
      const grouped = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) { acc[reaction.emoji] = { emoji: reaction.emoji, count: 0 } }
        acc[reaction.emoji].count++
        return acc
      }, {})
      return Object.values(grouped)
    },
    getStatusIcon (status) {
      const icons = {
        sent: 'fas fa-check text-muted',
        delivered: 'fas fa-check-double text-muted',
        read: 'fas fa-check-double text-primary'
      }
      return icons[status] || 'fas fa-clock text-muted'
    },
    getStatusTitle (status) {
      const titles = { sent: 'ส่งแล้ว', delivered: 'ส่งถึงแล้ว', read: 'อ่านแล้ว' }
      return titles[status] || 'กำลังส่ง'
    },
    getTypingText () {
      if (this.typingUsers.length === 1) { return `${this.typingUsers[0]} กำลังพิมพ์...` }
      if (this.typingUsers.length === 2) { return `${this.typingUsers[0]} และ ${this.typingUsers[1]} กำลังพิมพ์...` }
      return 'หลายคนกำลังพิมพ์...'
    },
    formatFileSize (bytes) {
      if (!bytes || bytes === 0) { return '0 B' }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    truncateText (text, maxLength) {
      if (!text) { return '' }
      return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
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
    showReactionPicker (messageId) {
      this.selectedMessageId = messageId
      this.showReactionPickerModal = true
      this.hideContextMenu()
    },
    addReactionEmoji (emoji) {
      if (this.selectedMessageId) {
        this.$emit('toggle-reaction', { messageId: this.selectedMessageId, emoji })
      }
      this.showReactionPickerModal = false
      this.selectedMessageId = null
    },
    toggleReaction (messageId, emoji) {
      this.$emit('toggle-reaction', { messageId, emoji })
    },
    replyToMessage (message) {
      this.$emit('reply-to', message)
      this.hideContextMenu()
    },
    editMessage (message) {
      this.$emit('edit-message', message)
      this.hideContextMenu()
    },
    deleteMessage (messageId) {
      this.$emit('delete-message', messageId)
      this.hideContextMenu()
    },
    showContextMenu (event, message) {
      event.preventDefault()
      event.stopPropagation()

      const menuWidth = 200
      const menuHeight = message.userId === this.currentUserId ? 280 : 180
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let x = event.clientX
      let y = event.clientY

      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 10
      }

      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 10
      }

      this.contextMenu = {
        show: true,
        x,
        y,
        message
      }
    },
    hideContextMenu () {
      this.contextMenu.show = false
    },
    copyMessage (message) {
      if (message.content) {
        navigator.clipboard.writeText(message.content)
      }
      this.hideContextMenu()
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
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  min-height: 0;
  background: #ffffff;
  position: relative;
}

.message-bubble-container {
  display: flex;
  align-items: flex-end;
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-main {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 70%;
  transition: all 0.15s ease;
}

.message-main:hover .quick-actions {
  opacity: 1;
  pointer-events: auto;
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  transition: all 0.15s ease;
  max-width: 100%;
}

/* Default Theme */
.message-bubble.own {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

.message-bubble.other {
  background: #f8f9fa;
  color: #333333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  margin-right: auto;
}

/* Purple Theme */
[data-theme="purple"] .message-bubble.own {
  background: #f3e5f5;
  color: #4a148c;
  border: 1px solid #ba68c8;
}

[data-theme="purple"] .message-bubble.other {
  background: #f3e5f5;
  color: #4a148c;
  border: 1px solid #ba68c8;
}

[data-theme="purple"] .reply-line {
  background: linear-gradient(180deg, #667eea 0%, rgba(102, 126, 234, 0.5) 100%);
}

[data-theme="purple"] .reply-username-outside {
  color: #667eea;
}

[data-theme="purple"] .quick-action-btn:hover {
  color: #667eea;
}

[data-theme="purple"] .scroll-bottom-btn {
  color: #667eea;
}

/* Pink Theme */
[data-theme="pink"] .message-bubble.own {
  background: #fce4ec;
  color: #880e4f;
  border: 1px solid #f06292;
}

[data-theme="pink"] .message-bubble.other {
  background: #fce4ec;
  color: #880e4f;
  border: 1px solid #f06292;
}

[data-theme="pink"] .reply-line {
  background: linear-gradient(180deg, #f093fb 0%, rgba(240, 147, 251, 0.5) 100%);
}

[data-theme="pink"] .reply-username-outside {
  color: #f093fb;
}

[data-theme="pink"] .quick-action-btn:hover {
  color: #f093fb;
}

[data-theme="pink"] .scroll-bottom-btn {
  color: #f093fb;
}

/* Green Theme */
[data-theme="green"] .message-bubble.own {
  background: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #4caf50;
}

[data-theme="green"] .message-bubble.other {
  background: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #4caf50;
}

[data-theme="green"] .reply-line {
  background: linear-gradient(180deg, #4facfe 0%, rgba(79, 172, 254, 0.5) 100%);
}

[data-theme="green"] .reply-username-outside {
  color: #4facfe;
}

[data-theme="green"] .quick-action-btn:hover {
  color: #4facfe;
}

[data-theme="green"] .scroll-bottom-btn {
  color: #4facfe;
}

/* Orange Theme */
[data-theme="orange"] .message-bubble.own {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ff9800;
}

[data-theme="orange"] .message-bubble.other {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ff9800;
}

[data-theme="orange"] .reply-line {
  background: linear-gradient(180deg, #fa709a 0%, rgba(250, 112, 154, 0.5) 100%);
}

[data-theme="orange"] .reply-username-outside {
  color: #fa709a;
}

[data-theme="orange"] .quick-action-btn:hover {
  color: #fa709a;
}

[data-theme="orange"] .scroll-bottom-btn {
  color: #fa709a;
}

/* Dark Theme */
[data-theme="dark"] .message-bubble.own {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  color: white;
}

[data-theme="dark"] .message-bubble.other {
  background: #37474f;
  color: #ffffff;
}

[data-theme="dark"] .message-list-container {
  background: #1a1a1a;
}

[data-theme="dark"] .message-list {
  background: #1a1a1a;
}

[data-theme="dark"] .reply-line {
  background: linear-gradient(180deg, #757575 0%, rgba(117, 117, 117, 0.5) 100%);
}

[data-theme="dark"] .reply-username-outside {
  color: #9e9e9e;
}

[data-theme="dark"] .reply-preview-outside {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .own-message .reply-preview-outside {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .quick-action-btn {
  background: #2c2c2c;
  border-color: #3a3a3a;
  color: #ffffff;
}

[data-theme="dark"] .quick-action-btn:hover {
  background: #3a3a3a;
  color: #ffffff;
}

[data-theme="dark"] .scroll-bottom-btn {
  background: #2c2c2c;
  border-color: #3a3a3a;
  color: #ffffff;
}

[data-theme="dark"] .date-separator small {
  background: rgba(44, 44, 44, 0.95);
  border-color: #3a3a3a;
  color: #9e9e9e;
}

[data-theme="dark"] .sender-name {
  color: #b0b0b0;
}

/* Minimal Theme */
[data-theme="minimal"] .message-bubble.own {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
  box-shadow: none;
}

[data-theme="minimal"] .message-bubble.other {
  background: #f8f9fa;
  color: #333333;
  border: 1px solid #e0e0e0;
  box-shadow: none;
}

[data-theme="minimal"] .message-list-container {
  background: #ffffff;
}

[data-theme="minimal"] .message-list {
  background: #ffffff;
}

[data-theme="minimal"] .reply-line {
  background: #cccccc;
}

[data-theme="minimal"] .reply-username-outside {
  color: #666666;
}

[data-theme="minimal"] .reply-preview-outside {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
}

[data-theme="minimal"] .own-message .reply-preview-outside {
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

[data-theme="minimal"] .quick-action-btn {
  background: #ffffff;
  border-color: #cccccc;
  color: #666666;
}

[data-theme="minimal"] .quick-action-btn:hover {
  background: #f8f9fa;
  color: #333333;
}

[data-theme="minimal"] .scroll-bottom-btn {
  background: #ffffff;
  border-color: #cccccc;
  color: #666666;
}

[data-theme="minimal"] .date-separator small {
  background: #f8f9fa;
  border-color: #e0e0e0;
  color: #666666;
}

[data-theme="minimal"] .sender-name {
  color: #666666;
}

.sender-name {
  font-size: 11px;
  font-weight: 600;
  color: #6a0085;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.reply-preview-outside {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  max-width: 100%;
}

.reply-preview-outside:hover {
  background: rgba(0, 0, 0, 0.06);
}

.own-message .reply-preview-outside {
  background: rgba(0, 132, 255, 0.1);
}

.own-message .reply-preview-outside:hover {
  background: rgba(0, 132, 255, 0.15);
}

.reply-line {
  width: 3px;
  min-width: 3px;
  height: 100%;
  min-height: 36px;
  background: linear-gradient(180deg, #0084ff 0%, rgba(0, 132, 255, 0.5) 100%);
  border-radius: 2px;
  flex-shrink: 0;
}

.own-message .reply-line {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
}

.reply-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reply-username-outside {
  font-size: 12px;
  font-weight: 600;
  color: #0084ff;
  line-height: 1.2;
}

.own-message .reply-username-outside {
  color: #0084ff;
}

.reply-text-outside {
  font-size: 13px;
  color: #65676b;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.own-message .reply-text-outside {
  color: #1c1e21;
}

.message-content {
  margin-bottom: 0;
}

.message-text {
  line-height: 1.34;
  word-break: break-word;
  font-size: 15px;
  font-weight: 400;
}

.message-image img {
  max-width: 320px;
  max-height: 320px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-image img:hover {
  transform: scale(0.98);
  opacity: 0.95;
}

.image-caption {
  font-size: 14px;
  color: inherit;
  margin-top: 6px;
}

.message-file {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.15s ease;
}

.message-file:hover {
  background: rgba(0, 0, 0, 0.08);
}

.file-info {
  min-width: 200px;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: inherit;
  margin-bottom: 2px;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
  margin-top: 4px;
  gap: 4px;
}

.message-meta small {
  color: #65676b;
}

.message-bubble.own .message-meta small {
  color: rgba(255, 255, 255, 0.7);
}

.message-status {
  display: flex;
  align-items: center;
}

.message-reactions-outside {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.reaction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e4e6eb;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
}

.reaction-pill:hover {
  background: #f0f2f5;
  transform: scale(1.05);
}

.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}

.reaction-count {
  color: #65676b;
  font-weight: 500;
  font-size: 12px;
}

.quick-actions {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 10;
}

.own-message .quick-actions {
  left: -120px;
}

.message-wrapper:not(.own-message) .quick-actions {
  right: -120px;
}

.quick-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e4e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #65676b;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.quick-action-btn:hover {
  background: #f0f2f5;
  color: #0084ff;
  transform: scale(1.1);
}

.quick-action-btn:active {
  transform: scale(0.95);
}

.context-menu {
  position: fixed;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 8px 0;
  z-index: 9999;
  min-width: 200px;
  animation: contextMenuSlide 0.15s ease-out;
}

@keyframes contextMenuSlide {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #050505;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.context-menu-item:hover {
  background: #f0f2f5;
}

.context-menu-item.danger {
  color: #fa3e3e;
}

.context-menu-item.danger:hover {
  background: #ffebee;
}

.context-menu-item i {
  width: 18px;
  text-align: center;
  font-size: 16px;
}

.context-menu-divider {
  height: 1px;
  background: #e4e6eb;
  margin: 8px 0;
}

.date-separator {
  position: sticky;
  top: 8px;
  z-index: 10;
  margin: 16px 0;
  text-align: center;
}

.date-separator small {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e4e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
  color: #65676b;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.message-group {
  margin-bottom: 16px;
}

.message-wrapper {
  margin-bottom: 2px;
  position: relative;
}

.message-wrapper:hover {
  z-index: 5;
}

.own-message .message-bubble-container {
  justify-content: flex-end;
}

.own-message .message-main {
  align-items: flex-end;
}

.message-avatar {
  flex-shrink: 0;
  margin-right: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 2px solid #ffffff;
}

.typing-container {
  padding: 8px 16px;
  animation: slideIn 0.2s ease-out;
}

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8e8e93;
  animation: typingBounce 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.typing-text {
  color: #8e8e93;
  font-size: 13px;
  margin: 0;
  font-weight: 400;
}

.scroll-bottom-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 20;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e4e6eb;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  color: #0084ff;
  cursor: pointer;
  font-size: 18px;
}

.scroll-bottom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.scroll-bottom-btn:active {
  transform: scale(0.95);
}

.new-messages-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #fa3e3e;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
  border: 2px solid #ffffff;
}

#image-modal ::v-deep .modal-content {
  background: transparent;
  border: none;
  box-shadow: none;
}

#image-modal ::v-deep .modal-body {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
}

.reaction-picker-modal ::v-deep .modal-content {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid #e4e6eb;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalZoomIn 0.2s ease-out;
}

@keyframes modalZoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.reaction-picker-body {
  padding: 16px !important;
}

.reaction-picker-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.reaction-emoji-btn {
  font-size: 28px;
  padding: 12px;
  background: #f0f2f5;
  border: 1px solid #e4e6eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}

.reaction-emoji-btn:hover {
  background: #e4e6eb;
  transform: scale(1.15);
}

.reaction-emoji-btn:active {
  transform: scale(0.95);
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.text-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .message-list-container {
    height: calc(100vh - 60px);
  }

  .message-list {
    padding: 12px 8px;
  }

  .reply-preview-outside {
    padding: 6px 10px;
    margin-bottom: 3px;
    border-radius: 10px;
  }

  .reply-line {
    min-height: 32px;
  }

  .reply-username-outside {
    font-size: 11px;
  }

  .reply-text-outside {
    font-size: 12px;
  }

  .message-main {
    max-width: 85%;
  }

  .message-bubble {
    max-width: 100%;
    padding: 8px 12px;
  }

  .message-image img {
    max-width: 280px;
    max-height: 280px;
  }

  .quick-actions {
    position: static;
    transform: none;
    opacity: 1;
    pointer-events: auto;
    margin-top: 4px;
    justify-content: flex-end;
  }

  .own-message .quick-actions {
    left: auto;
    justify-content: flex-end;
  }

  .message-wrapper:not(.own-message) .quick-actions {
    right: auto;
    justify-content: flex-start;
  }

  .scroll-bottom-btn {
    width: 44px;
    height: 44px;
    bottom: 70px;
    right: 16px;
  }

  .reaction-picker-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .message-main {
    max-width: 90%;
  }

  .message-bubble {
    padding: 6px 10px;
    font-size: 14px;
  }

  .message-image img {
    max-width: 240px;
    max-height: 240px;
  }

  .message-text {
    font-size: 14px;
  }

  .quick-action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .context-menu {
    min-width: 180px;
  }

  .context-menu-item {
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (prefers-color-scheme: dark) {
  .message-list-container {
    background: #000000;
  }

  .message-list {
    background: #000000;
  }

  .message-bubble.other {
    background: #262626;
    color: #ffffff;
  }

  .sender-name {
    color: #a8a8a8;
  }

  .reply-preview-outside {
    background: rgba(255, 255, 255, 0.05);
  }

  .reply-preview-outside:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .own-message .reply-preview-outside {
    background: rgba(0, 149, 246, 0.15);
  }

  .own-message .reply-preview-outside:hover {
    background: rgba(0, 149, 246, 0.2);
  }

  .reply-line {
    background: linear-gradient(180deg, #0095f6 0%, rgba(0, 149, 246, 0.5) 100%);
  }

  .reply-username-outside {
    color: #0095f6;
  }

  .reply-text-outside {
    color: #a8a8a8;
  }

  .own-message .reply-text-outside {
    color: #e0e0e0;
  }

  .message-meta small {
    color: #a8a8a8;
  }

  .message-file {
    background: rgba(255, 255, 255, 0.1);
  }

  .message-file:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .reaction-pill {
    background: #262626;
    border-color: #3a3a3a;
  }

  .reaction-pill:hover {
    background: #3a3a3a;
  }

  .reaction-count {
    color: #a8a8a8;
  }

  .quick-action-btn {
    background: #262626;
    border-color: #3a3a3a;
    color: #ffffff;
  }

  .quick-action-btn:hover {
    background: #3a3a3a;
    color: #0095f6;
  }

  .context-menu {
    background: #262626;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }

  .context-menu-item {
    color: #ffffff;
  }

  .context-menu-item:hover {
    background: #3a3a3a;
  }

  .context-menu-item.danger {
    color: #ed4956;
  }

  .context-menu-item.danger:hover {
    background: rgba(237, 73, 86, 0.1);
  }

  .context-menu-divider {
    background: #3a3a3a;
  }

  .date-separator small {
    background: rgba(38, 38, 38, 0.95);
    border-color: #3a3a3a;
    color: #a8a8a8;
  }

  .typing-bubble {
    background: #262626;
  }

  .typing-dots span {
    background: #a8a8a8;
  }

  .typing-text {
    color: #a8a8a8;
  }

  .scroll-bottom-btn {
    background: #262626;
    border-color: #3a3a3a;
    color: #0095f6;
  }

  .new-messages-badge {
    background: #ed4956;
    border-color: #000000;
  }

  .reaction-picker-modal ::v-deep .modal-content {
    background: rgba(38, 38, 38, 0.98);
    border-color: #3a3a3a;
  }

  .reaction-emoji-btn {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }

  .reaction-emoji-btn:hover {
    background: #4a4a4a;
  }

  .message-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
  }

  .message-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}

* {
  -webkit-tap-highlight-color: transparent;
}

.message-bubble,
.quick-action-btn,
.reaction-pill,
.context-menu-item {
  -webkit-user-select: none;
  user-select: none;
}

.message-text {
  -webkit-user-select: text;
  user-select: text;
}

.message-list {
  scroll-behavior: smooth;
}

@media (max-width: 768px) {
  .message-list::-webkit-scrollbar {
    display: none;
  }

  .message-list {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.reaction-pill {
  animation: reactionAppear 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes reactionAppear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.message-status i {
  font-size: 14px;
  transition: color 0.15s ease;
}

.message-status .fa-check {
  color: #65676b;
}

.message-status .fa-check-double.text-primary {
  color: #0084ff !important;
}

.message-avatar {
  transition: all 0.2s ease;
  cursor: pointer;
}

.message-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.context-menu::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
  pointer-events: none;
}

.message-wrapper {
  isolation: isolate;
  animation: messageSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Minimal Theme */
[data-theme="minimal"] .message-bubble.own {
  background: #2563eb;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

[data-theme="minimal"] .message-bubble.other {
  background: #f1f5f9;
  color: #1e293b;
  border-radius: 16px 16px 16px 4px;
}

[data-theme="minimal"] .message-list-container {
  background: #ffffff;
}

[data-theme="minimal"] .message-list {
  background: #ffffff;
}

[data-theme="minimal"] .reply-line {
  background: linear-gradient(180deg, #2563eb 0%, rgba(37, 99, 235, 0.5) 100%);
}

[data-theme="minimal"] .reply-username-outside {
  color: #2563eb;
}

[data-theme="minimal"] .reply-preview-outside {
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

[data-theme="minimal"] .own-message .reply-preview-outside {
  background: rgba(37, 99, 235, 0.1);
}

[data-theme="minimal"] .quick-action-btn {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #64748b;
}

[data-theme="minimal"] .quick-action-btn:hover {
  background: #f8fafc;
  color: #2563eb;
}

[data-theme="minimal"] .scroll-bottom-btn {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #2563eb;
}

[data-theme="minimal"] .date-separator small {
  background: rgba(248, 250, 252, 0.95);
  border-color: #e2e8f0;
  color: #64748b;
}

[data-theme="minimal"] .sender-name {
  color: #2563eb;
}

.text-center .b-spinner {
  color: #0084ff;
}

@media (hover: none) and (pointer: coarse) {
  .message-bubble {
    position: relative;
  }

  .message-bubble::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    transition: background 0.3s ease;
  }

  .message-bubble:active::after {
    background: rgba(0, 0, 0, 0.05);
  }

  .message-bubble.own:active::after {
    background: rgba(255, 255, 255, 0.15);
  }

  .quick-action-btn,
  .reaction-pill,
  .context-menu-item {
    min-height: 44px;
    min-width: 44px;
  }
}

.quick-action-btn:focus,
.reaction-pill:focus,
.context-menu-item:focus,
.scroll-bottom-btn:focus {
  outline: 2px solid #0084ff;
  outline-offset: 2px;
}
</style>

// components/MessageList.vue
<template>
  <div class="message-list-container" :data-theme="chatTheme">
    <div ref="messageList" class="message-list" @scroll="handleScroll">
      <div v-if="loadingMore" class="text-center py-3">
        <b-spinner small class="mr-2" />
        <span class="loading-text">กำลังโหลดข้อความ...</span>
      </div>

      <div v-for="(group, date) in groupedMessages" :key="date" class="message-group">
        <div class="date-separator text-center my-3">
          <small class="date-pill">{{ formatDate(date) }}</small>
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
              size="28"
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
                        <small class="file-size-text">{{ formatFileSize(message.fileSize) }}</small>
                      </div>
                      <b-button size="sm" class="ml-auto download-btn" @click="downloadFile(message.fileUrl, message.fileName)">
                        <i class="fas fa-download" />
                      </b-button>
                    </div>
                  </div>
                </div>

                <div class="message-meta">
                  <small class="meta-time">{{ formatMessageTime(message.createdAt) }}</small>
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
      modal-class="sticker-modal"
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
        sent: 'fas fa-check',
        delivered: 'fas fa-check-double',
        read: 'fas fa-check-double read'
      }
      return icons[status] || 'fas fa-clock'
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
/*
  Design tokens — one dark surface system shared with MemberList.vue.
  Everything used to be bright-violet header + near-black chat + cream
  sidebar, each with its own hard-edged brutalist border/shadow. That's
  three unrelated moods stitched together. This version keeps a single
  dark ink surface throughout and spends contrast only where it carries
  meaning: who sent a message, and what's actionable.
*/
.message-list-container {
  --bg: #121218;
  --surface: #1c1c26;
  --surface-raised: #262636;
  --ink: #0d0d12;
  --cream: #f3f1ec;
  --text: #f3f1ec;
  --text-muted: rgba(243, 241, 236, 0.56);
  --violet: #8b7ffb;
  --violet-deep: #6a5cf0;
  --coral: #ff6b5b;
  --mint: #34d9a6;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --radius-lg: 20px;
  --radius-md: 10px;
  --radius-pill: 999px;
  --shadow-soft: 0 6px 16px rgba(0, 0, 0, 0.35);
  --shadow-tight: 0 2px 6px rgba(0, 0, 0, 0.3);

  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--bg);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.message-list::-webkit-scrollbar { width: 6px; }
.message-list::-webkit-scrollbar-track { background: transparent; }
.message-list::-webkit-scrollbar-thumb { background: var(--surface-raised); border-radius: 3px; }

.loading-text { color: var(--text-muted); font-size: 0.85rem; }

.date-pill {
  background: var(--surface-raised);
  color: var(--text-muted);
  border-radius: var(--radius-pill);
  padding: 5px 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: inline-block;
}

.message-wrapper {
  margin-bottom: 8px;
  max-width: 100%;
}

.message-bubble-container {
  display: flex;
  align-items: flex-start;
}

.message-avatar {
  box-shadow: var(--shadow-tight);
  flex-shrink: 0;
}

.message-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: min(58%, 380px);
}

.message-wrapper.own-message .message-bubble-container {
  flex-direction: row-reverse;
}

.message-wrapper.own-message .message-main {
  align-items: flex-end;
}

/* Other people's messages: neutral dark surface, left-aligned, always
   paired with an avatar + name above so authorship reads instantly. */
.message-bubble.other {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 4px;
}

/* Your own messages: violet fill, no border, opposite corner flattened —
   the two shapes are mirror images of each other at a glance. */
.message-bubble.own {
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  color: #ffffff;
  border-radius: var(--radius-md) var(--radius-md) 4px var(--radius-md);
}

/* Theme: Pink */
.message-list-container[data-theme="pink"] .message-bubble.own {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Theme: Purple */
.message-list-container[data-theme="purple"] .message-bubble.own {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Theme: Green */
.message-list-container[data-theme="green"] .message-bubble.own {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Theme: Orange */
.message-list-container[data-theme="orange"] .message-bubble.own {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Theme: Dark */
.message-list-container[data-theme="dark"] .message-bubble.own {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
}

/* Theme: Minimal */
.message-list-container[data-theme="minimal"] .message-bubble.own {
  background: #ffffff;
  color: #1a1a1a;
}

/* Theme: Default */
.message-list-container[data-theme="default"] .message-bubble.own {
  background: #0084ff;
}

.message-bubble {
  width: fit-content;
  max-width: 100%;
  padding: 6px 10px;
  line-height: 1;
  box-shadow: var(--shadow-tight);
}

.message-bubble * {
  line-height: 1.3;
}

.sender-name {
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--violet);
  margin-bottom: 3px;
}

.message-text {
  font-size: 0.82rem;
  line-height: 0.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-image img {
  max-width: 220px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: block;
}

.image-caption {
  font-size: 0.85rem;
  opacity: 0.85;
}

.message-file .file-info {
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  gap: 10px;
}

.message-bubble.own .file-info { background: rgba(255, 255, 255, 0.16); }

.file-name {
  font-weight: 600;
  font-size: 0.85rem;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size-text { opacity: 0.7; font-size: 0.75rem; }

.download-btn {
  background: rgba(255, 255, 255, 0.12) !important;
  border: none !important;
  color: inherit !important;
  border-radius: 50% !important;
  width: 30px;
  height: 30px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover { background: rgba(255, 255, 255, 0.22) !important; }

.message-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  line-height: 1;
  justify-content: flex-end;
}

.meta-time { opacity: 0.6; font-size: 0.68rem; line-height: 1; }
.message-bubble.own .meta-time { color: rgba(255, 255, 255, 0.8); }

.message-status i { font-size: 0.72rem; opacity: 0.75; }
.message-status i.read { color: var(--mint); opacity: 1; }

.reply-preview-outside {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: var(--surface-raised);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  margin-bottom: 4px;
  cursor: pointer;
  max-width: 100%;
}

.reply-line {
  width: 3px;
  align-self: stretch;
  background: var(--coral);
  border-radius: 2px;
  flex-shrink: 0;
}

.reply-username-outside {
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--violet);
}

.reply-text-outside {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-reactions-outside {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.reaction-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-raised);
  border: none;
  border-radius: var(--radius-pill);
  padding: 2px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.12s ease;
}

.reaction-pill:hover { background: rgba(139, 127, 251, 0.25); }

.reaction-count { font-weight: 700; color: var(--text); }

.quick-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.message-wrapper:hover .quick-actions { opacity: 1; }

.quick-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: var(--surface-raised);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: color 0.12s ease, background 0.12s ease;
}

.quick-action-btn:hover {
  background: rgba(139, 127, 251, 0.25);
  color: var(--text);
}

.typing-container { margin-top: 6px; }

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border-radius: var(--radius-pill);
  padding: 8px 14px;
}

.typing-dots { display: flex; gap: 3px; }

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--violet);
  animation: typing-bounce 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2) { animation-delay: 0.15s; }
.typing-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-text {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

.scroll-bottom-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--coral);
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s ease;
}

.scroll-bottom-btn:hover {
  transform: translateY(-2px);
}

.new-messages-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--mint);
  color: var(--ink);
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.context-menu {
  position: fixed;
  z-index: 2000;
  background: var(--surface-raised);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 6px;
  min-width: 190px;
}

.context-menu-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.12s ease;
}

.context-menu-item:hover { background: rgba(139, 127, 251, 0.2); }

.context-menu-item.danger { color: var(--coral); }
.context-menu-item.danger:hover { background: rgba(255, 107, 91, 0.18); }

.context-menu-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 4px 6px;
}

@media (max-width: 768px) {
  .message-list { padding: 14px 16px; }
  .message-main { max-width: 78%; }
  .message-bubble { padding: 8px 12px; font-size: 13px; }
  .scroll-bottom-btn { right: 16px; bottom: 16px; width: 40px; height: 40px; }
}

@media (max-width: 480px) {
  .message-image img { max-width: 200px; }
}
</style>

<style>
.reaction-picker-modal .modal-content {
  background: #1c1c26;
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

.reaction-picker-body { padding: 18px; }

.reaction-picker-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.reaction-emoji-btn {
  font-size: 1.6rem;
  padding: 10px;
  background: #262636;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.reaction-emoji-btn:hover {
  background: rgba(139, 127, 251, 0.3);
}

.sticker-modal .modal-content {
  background: #121218;
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
</style>

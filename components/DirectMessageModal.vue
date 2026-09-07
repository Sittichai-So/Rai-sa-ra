<template>
  <b-modal
    v-model="showModal"
    size="lg"
    centered
    hide-header
    modal-class="modern-dm-modal"
    body-class="p-0"
    @hidden="closeModal"
  >
    <div class="dm-modal-header-custom">
      <div class="dm-modal-title">
        <i class="fas fa-comments" />
        <span>แชทกับ {{ friendName }}</span>
      </div>
      <button class="dm-modal-close-btn" @click="closeModal">
        <i class="fas fa-times" />
      </button>
    </div>
    <div class="dm-chat-container">
      <div ref="messagesContainer" class="dm-messages" @scroll="onScroll">
        <div v-if="loadingMore" class="loading-messages">
          <i class="fas fa-spinner fa-spin" /> กำลังโหลด...
        </div>

        <div
          v-for="message in messages"
          :key="message._id"
          class="dm-message"
          :class="{ 'own-message': message.senderId === currentUserId }"
        >
          <div class="message-avatar">
            <img v-if="message.senderAvatar" :src="message.senderAvatar" :alt="message.senderName">
            <div v-else class="avatar-placeholder">
              {{ getInitials(message.senderName) }}
            </div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ message.senderName }}</span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>

            <div v-if="editingId === message._id" class="message-edit">
              <input
                v-model="editText"
                type="text"
                class="message-edit-input"
                @keyup.enter="saveEdit(message)"
                @keyup.esc="cancelEdit"
              >
              <div class="message-edit-actions">
                <button class="me-save" @click="saveEdit(message)">
                  บันทึก
                </button>
                <button class="me-cancel" @click="cancelEdit">
                  ยกเลิก
                </button>
              </div>
            </div>

            <div v-else class="message-bubble-row">
              <div v-if="message.type === 'image'" class="message-media">
                <img :src="resolveFile(message.fileUrl)" :alt="message.fileName" @click="openImage(message.fileUrl)">
              </div>
              <a
                v-else-if="message.type === 'file'"
                class="message-file"
                :href="resolveFile(message.fileUrl)"
                target="_blank"
              >
                <i class="fas fa-file" />
                <span class="mf-name">{{ message.fileName }}</span>
                <span class="mf-size">{{ formatSize(message.fileSize) }}</span>
              </a>
              <div v-else class="message-text">
                {{ message.content }}
                <span v-if="message.edited" class="edited-tag">แก้ไขแล้ว</span>
              </div>

              <div v-if="message.senderId === currentUserId" class="message-actions">
                <button v-if="message.type === 'text'" title="แก้ไข" @click="startEdit(message)">
                  <i class="fas fa-pen" />
                </button>
                <button title="ลบ" @click="removeMessage(message)">
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin" /> กำลังโหลดข้อความ...
        </div>

        <div v-if="!loading && messages.length === 0" class="empty-messages">
          <i class="fas fa-comments" />
          <p>เริ่มการสนทนากับ {{ friendName }}</p>
        </div>
      </div>

      <div v-if="friendTyping" class="dm-typing">
        {{ friendName }} กำลังพิมพ์<span class="dot-dot">...</span>
      </div>

      <div class="dm-input-area">
        <div class="input-container">
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            hidden
            @change="onFileSelected"
          >
          <button class="attach-btn" :disabled="uploading" title="แนบไฟล์" @click="pickFile">
            <i v-if="uploading" class="fas fa-spinner fa-spin" />
            <i v-else class="fas fa-paperclip" />
          </button>
          <input
            v-model="newMessage"
            type="text"
            placeholder="พิมพ์ข้อความ..."
            class="message-input"
            @input="onTyping"
            @keyup.enter="sendMessage"
          >
          <button
            class="send-btn"
            :disabled="!newMessage.trim() || sending"
            @click="sendMessage"
          >
            <i v-if="sending" class="fas fa-spinner fa-spin" />
            <i v-else class="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DirectMessageModal',
  props: {
    friend: {
      type: Object,
      default: null
    },
    currentUserId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showModal: false,
      messages: [],
      newMessage: '',
      loading: false,
      loadingMore: false,
      sending: false,
      uploading: false,
      page: 1,
      hasMore: false,
      editingId: null,
      editText: '',
      friendTyping: false,
      friendTypingTimer: null,
      typingSentAt: 0
    }
  },
  computed: {
    friendName () {
      return this.friend ? this.friend.displayName || this.friend.fullname : ''
    }
  },
  watch: {
    friend (newFriend) {
      if (newFriend && this.showModal) {
        this.loadMessages()
      }
    }
  },
  mounted () {
    if (this.$socket) {
      this.$socket.on('dm:new', this.onIncomingDM)
      this.$socket.on('dm:edited', this.onDmEdited)
      this.$socket.on('dm:deleted', this.onDmDeleted)
      this.$socket.on('dm:typing', this.onDmTyping)
      this.$socket.on('dm:stopTyping', this.onDmStopTyping)
    }
  },
  beforeDestroy () {
    if (this.$socket) {
      this.$socket.off('dm:new', this.onIncomingDM)
      this.$socket.off('dm:edited', this.onDmEdited)
      this.$socket.off('dm:deleted', this.onDmDeleted)
      this.$socket.off('dm:typing', this.onDmTyping)
      this.$socket.off('dm:stopTyping', this.onDmStopTyping)
    }
    clearTimeout(this.friendTypingTimer)
  },
  methods: {
    open () {
      this.showModal = true
      this.messages = []
      this.page = 1
      this.hasMore = false
      this.friendTyping = false
      this.loadMessages()
    },
    closeModal () {
      this.showModal = false
      this.messages = []
      this.newMessage = ''
      this.editingId = null
      this.friendTyping = false
      this.emitStopTyping()
    },
    resolveFile (url) {
      if (!url) { return '' }
      if (/^https?:\/\//.test(url)) { return url }
      return (process.env.API_FILE_BASE || '') + url
    },
    mapMessage (m) {
      const mine = String(m.senderId) === String(this.currentUserId)
      return {
        _id: m._id,
        content: m.content,
        type: m.type || 'text',
        fileUrl: m.fileUrl || null,
        fileName: m.fileName || null,
        fileSize: m.fileSize || null,
        edited: m.edited || false,
        senderId: String(m.senderId),
        senderName: mine ? 'คุณ' : (this.friend?.displayName || this.friend?.fullname || 'เพื่อน'),
        senderAvatar: mine ? null : (this.friend?.avatar || null),
        createdAt: m.createdAt
      }
    },
    async loadMessages () {
      if (!this.friend) { return }

      this.loading = true
      this.page = 1
      try {
        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$get(url, { params: { page: 1, limit: 30 } })
        const list = res.result?.messages || []
        this.messages = list.map(m => this.mapMessage(m))
        this.hasMore = res.result?.hasMore || false
        this.$emit('read', this.friend.friendId)
      } catch (error) {
        this.$bvToast && this.$bvToast.toast('โหลดข้อความไม่สำเร็จ', { variant: 'danger', solid: true })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    async loadMore () {
      if (!this.friend || !this.hasMore || this.loadingMore) { return }
      this.loadingMore = true
      const container = this.$refs.messagesContainer
      const prevHeight = container ? container.scrollHeight : 0
      try {
        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$get(url, { params: { page: this.page + 1, limit: 30 } })
        const older = (res.result?.messages || []).map(m => this.mapMessage(m))
        if (older.length) {
          this.messages = [...older, ...this.messages]
          this.page += 1
          this.hasMore = res.result?.hasMore || false
          this.$nextTick(() => {
            if (container) { container.scrollTop = container.scrollHeight - prevHeight }
          })
        } else {
          this.hasMore = false
        }
      } catch (error) {
      } finally {
        this.loadingMore = false
      }
    },
    onScroll () {
      const el = this.$refs.messagesContainer
      if (el && el.scrollTop < 40 && this.hasMore && !this.loadingMore) {
        this.loadMore()
      }
    },
    async sendMessage () {
      const text = this.newMessage.trim()
      if (!text || !this.friend || this.sending) { return }

      this.sending = true
      this.newMessage = ''
      this.emitStopTyping()
      try {
        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$post(url, { content: text })
        if (res.result) {
          this.messages.push(this.mapMessage(res.result))
          this.$emit('sent', { friendId: this.friend.friendId, content: text })
          this.$nextTick(() => this.scrollToBottom())
        }
      } catch (error) {
        this.newMessage = text
        this.$bvToast && this.$bvToast.toast(
          error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      } finally {
        this.sending = false
      }
    },
    pickFile () {
      this.$refs.fileInput && this.$refs.fileInput.click()
    },
    async onFileSelected (e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file || !this.friend) { return }
      if (file.size > 5 * 1024 * 1024) {
        this.$bvToast && this.$bvToast.toast('ไฟล์ต้องไม่เกิน 5MB', { variant: 'warning', solid: true })
        return
      }

      this.uploading = true
      try {
        const form = new FormData()
        form.append('file', file)
        const up = await this.$axios.$post(process.env.API_UPLOAD_FILE, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const f = up.result
        if (!f) { throw new Error('upload failed') }

        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$post(url, {
          content: '',
          file: {
            fileUrl: f.url,
            fileName: f.fileName,
            fileSize: f.fileSize,
            fileType: f.fileType
          }
        })
        if (res.result) {
          this.messages.push(this.mapMessage(res.result))
          this.$emit('sent', { friendId: this.friend.friendId, content: f.fileName })
          this.$nextTick(() => this.scrollToBottom())
        }
      } catch (error) {
        this.$bvToast && this.$bvToast.toast(
          error.response?.data?.message || 'ส่งไฟล์ไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      } finally {
        this.uploading = false
      }
    },
    startEdit (message) {
      this.editingId = message._id
      this.editText = message.content
    },
    cancelEdit () {
      this.editingId = null
      this.editText = ''
    },
    async saveEdit (message) {
      const text = this.editText.trim()
      if (!text || text === message.content) { this.cancelEdit(); return }
      try {
        const url = process.env.API_DM_MESSAGE.replace(':messageId', message._id)
        const res = await this.$axios.$patch(url, { content: text })
        if (res.result) {
          message.content = res.result.content
          message.edited = true
        }
      } catch (error) {
        this.$bvToast && this.$bvToast.toast(
          error.response?.data?.message || 'แก้ไขไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      } finally {
        this.cancelEdit()
      }
    },
    async removeMessage (message) {
      const ok = await this.$bvModal.msgBoxConfirm('ลบข้อความนี้?', {
        okVariant: 'danger', okTitle: 'ลบ', cancelTitle: 'ยกเลิก', centered: true
      })
      if (!ok) { return }
      try {
        const url = process.env.API_DM_MESSAGE.replace(':messageId', message._id)
        await this.$axios.$delete(url)
        this.messages = this.messages.filter(m => m._id !== message._id)
      } catch (error) {
        this.$bvToast && this.$bvToast.toast(
          error.response?.data?.message || 'ลบไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      }
    },
    onTyping () {
      if (!this.friend || !this.$socket) { return }
      const now = Date.now()
      if (now - this.typingSentAt > 2000) {
        this.typingSentAt = now
        this.$socket.emit('dm:typing', { toUserId: this.friend.friendId })
      }
    },
    emitStopTyping () {
      if (this.friend && this.$socket) {
        this.$socket.emit('dm:stopTyping', { toUserId: this.friend.friendId })
      }
      this.typingSentAt = 0
    },
    onIncomingDM (m) {
      if (!this.showModal || !this.friend) { return }
      if (String(m.friendId) !== String(this.friend.friendId)) { return }
      this.friendTyping = false
      this.messages.push(this.mapMessage({ ...m, senderId: m.senderId }))
      this.$nextTick(() => this.scrollToBottom())
      this.markRead()
      this.$emit('read', this.friend.friendId)
    },
    onDmEdited (m) {
      if (!this.friend || String(m.friendId) !== String(this.friend.friendId)) { return }
      const msg = this.messages.find(x => x._id === m._id)
      if (msg) {
        msg.content = m.content
        msg.edited = true
      }
    },
    onDmDeleted (m) {
      if (!this.friend || String(m.friendId) !== String(this.friend.friendId)) { return }
      this.messages = this.messages.filter(x => x._id !== m._id)
    },
    onDmTyping (m) {
      if (!this.showModal || !this.friend) { return }
      if (String(m.friendId) !== String(this.friend.friendId)) { return }
      this.friendTyping = true
      clearTimeout(this.friendTypingTimer)
      this.friendTypingTimer = setTimeout(() => { this.friendTyping = false }, 4000)
    },
    onDmStopTyping (m) {
      if (!this.friend || String(m.friendId) !== String(this.friend.friendId)) { return }
      this.friendTyping = false
      clearTimeout(this.friendTypingTimer)
    },
    markRead () {
      if (!this.friend || !process.env.API_DM_READ) { return }
      const url = process.env.API_DM_READ.replace(':friendId', this.friend.friendId)
      this.$axios.$post(url).catch(() => {})
    },
    openImage (url) {
      window.open(this.resolveFile(url), '_blank')
    },
    scrollToBottom () {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    },
    getInitials (name) {
      if (!name) { return '?' }
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },
    formatTime (date) {
      const d = new Date(date)
      return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatSize (bytes) {
      if (!bytes) { return '' }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.dm-chat-container {
  --ink: #101014;
  --paper: #14141c;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --violet-deep: #5b4fd6;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line-sm: 2px;
  --shadow-xs: 2px 2px 0 var(--ink);
  --shadow-sm: 4px 4px 0 var(--ink);
  --radius-md: 14px;
  --radius-pill: 999px;

  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.modern-dm-modal .modal-content) {
  background: var(--paper);
  border: 3px solid var(--ink);
  border-radius: 20px;
  box-shadow: 8px 8px 0 var(--ink);
  overflow: hidden;
}

.dm-modal-header-custom {
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  border-bottom: 2px solid var(--ink);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dm-modal-title {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dm-modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid var(--ink);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--white);
}

.dm-modal-close-btn:hover {
  background: var(--coral);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.dm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background: var(--paper);
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

.dm-messages::-webkit-scrollbar { width: 6px; }
.dm-messages::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 3px; }

.dm-message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.dm-message.own-message {
  flex-direction: row-reverse;
}

.dm-message.own-message .message-content {
  margin-left: 0;
  margin-right: 10px;
  align-items: flex-end;
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--violet);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.message-content {
  margin-left: 10px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--cream);
}

.message-time {
  font-size: 11px;
  color: rgba(246, 243, 237, 0.5);
  margin-left: 8px;
}

.message-bubble-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.own-message .message-bubble-row {
  flex-direction: row-reverse;
}

.message-text {
  background: var(--white);
  color: var(--ink);
  padding: 9px 14px;
  border-radius: var(--radius-md);
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
  word-wrap: break-word;
  font-size: 0.92rem;
}

.own-message .message-text {
  background: var(--violet);
  color: var(--white);
}

.edited-tag {
  font-size: 10px;
  opacity: 0.6;
  margin-left: 6px;
  font-style: italic;
}

.message-media img {
  max-width: 220px;
  max-height: 260px;
  border-radius: var(--radius-md);
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  display: block;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  color: var(--ink);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
  text-decoration: none;
  max-width: 240px;
}

.mf-name {
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mf-size { font-size: 0.72rem; opacity: 0.6; flex-shrink: 0; }

.message-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.12s ease;
}

.dm-message:hover .message-actions { opacity: 1; }

.message-actions button {
  border: none;
  background: transparent;
  color: rgba(246, 243, 237, 0.5);
  cursor: pointer;
  padding: 4px;
  font-size: 11px;
}

.message-actions button:hover { color: var(--coral); }

.message-edit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-edit-input {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: var(--line-sm) solid var(--ink);
  font-size: 0.9rem;
  outline: none;
  min-width: 200px;
}

.message-edit-actions { display: flex; gap: 6px; }

.me-save,
.me-cancel {
  border: none;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.me-save { background: var(--violet); color: #fff; }
.me-cancel { background: rgba(246, 243, 237, 0.15); color: var(--cream); }

.loading-messages,
.empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: rgba(246, 243, 237, 0.6);
}

.loading-messages { padding: 12px; font-size: 0.85rem; }

.empty-messages i {
  font-size: 44px;
  margin-bottom: 12px;
  opacity: 0.5;
  color: var(--violet);
}

.dm-typing {
  padding: 4px 20px 6px;
  font-size: 0.8rem;
  color: var(--violet);
  background: #1b1b25;
  font-weight: 600;
}

.dot-dot { letter-spacing: 2px; }

.dm-input-area {
  border-top: 3px solid var(--ink);
  padding: 14px 16px;
  background: #1b1b25;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.attach-btn {
  width: 40px;
  height: 40px;
  border: var(--line-sm) solid var(--ink);
  border-radius: 50%;
  background: var(--yellow);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
}

.attach-btn:disabled { opacity: 0.5; cursor: default; }

.message-input {
  flex: 1;
  padding: 11px 16px;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-pill);
  outline: none;
  font-size: 14px;
  color: var(--ink);
  box-shadow: var(--shadow-xs);
}

.message-input::placeholder { color: rgba(16, 16, 20, 0.4); }

.message-input:focus {
  border-color: var(--violet);
  box-shadow: 4px 4px 0 var(--violet);
}

.send-btn {
  width: 42px;
  height: 42px;
  border: var(--line-sm) solid var(--ink);
  border-radius: 50%;
  background: var(--coral);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}

.send-btn:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: none;
}

.send-btn:disabled {
  background: var(--cream);
  color: rgba(16, 16, 20, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<style>
.dm-modal .modal-content {
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 6px 6px 0 #101014;
  overflow: hidden;
}

.dm-modal .dm-modal-header {
  background: #7c6ff5;
  border-bottom: 3px solid #101014;
  padding: 16px 20px;
}

.dm-modal .dm-modal-header .modal-title {
  font-family: 'Space Grotesk', 'Noto Sans Thai', sans-serif;
  font-weight: 800;
  color: #ffffff;
  font-size: 1rem;
}

.dm-modal .dm-modal-header .close {
  color: #ffffff;
  opacity: 0.9;
  text-shadow: none;
}

.dm-modal .dm-modal-body {
  padding: 0;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.dm-modal .modal-backdrop {
  background: rgba(16, 16, 20, 0.6);
}
</style>

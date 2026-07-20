// components/DirectMessageModal.vue
<template>
  <b-modal
    v-model="showModal"
    size="lg"
    :title="`แชทกับ ${friendName}`"
    modal-class="dm-modal"
    body-class="dm-modal-body"
    header-class="dm-modal-header"
    @hidden="closeModal"
  >
    <div class="dm-chat-container">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="dm-messages">
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
            <div class="message-text">
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin" /> กำลังโหลดข้อความ...
        </div>

        <!-- Empty state -->
        <div v-if="!loading && messages.length === 0" class="empty-messages">
          <i class="fas fa-comments" />
          <p>เริ่มการสนทนากับ {{ friendName }}</p>
        </div>
      </div>

      <!-- Message Input -->
      <div class="dm-input-area">
        <div class="input-container">
          <input
            v-model="newMessage"
            type="text"
            placeholder="พิมพ์ข้อความ..."
            class="message-input"
            @keyup.enter="sendMessage"
          >
          <button
            class="send-btn"
            :disabled="!newMessage.trim()"
            @click="sendMessage"
          >
            <i class="fas fa-paper-plane" />
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
      loading: false
    }
  },
  computed: {
    friendName () {
      return this.friend ? this.friend.displayName || this.friend.fullname : ''
    }
  },
  watch: {
    friend (newFriend) {
      if (newFriend) {
        this.loadMessages()
      }
    }
  },
  methods: {
    open () {
      this.showModal = true
      this.loadMessages()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    closeModal () {
      this.showModal = false
      this.messages = []
      this.newMessage = ''
    },
    loadMessages () {
      if (!this.friend) { return }

      this.loading = true
      try {
        // TODO: Replace with actual API call
        // const response = await this.$axios.$get(`/api/dm/messages/${this.friend.friendId}`)
        // this.messages = response.result || []

        // Mock data for now
        this.messages = [
          {
            _id: '1',
            content: 'สวัสดีครับ!',
            senderId: this.currentUserId,
            senderName: 'คุณ',
            senderAvatar: null,
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            _id: '2',
            content: 'สวัสดี! มีอะไรให้ช่วยไหม?',
            senderId: this.friend.friendId,
            senderName: this.friend.displayName,
            senderAvatar: this.friend.avatar,
            createdAt: new Date(Date.now() - 1800000)
          }
        ]
      } catch (error) {
        console.error('Error loading DM messages:', error)
      } finally {
        this.loading = false
      }
    },
    sendMessage () {
      if (!this.newMessage.trim() || !this.friend) { return }

      const messageData = {
        content: this.newMessage.trim(),
        receiverId: this.friend.friendId,
        senderId: this.currentUserId,
        createdAt: new Date()
      }

      try {
        // TODO: Replace with actual API call
        // const response = await this.$axios.$post('/api/dm/send', messageData)
        // this.messages.push(response.result)

        // Mock sending for now
        const mockMessage = {
          _id: Date.now().toString(),
          ...messageData,
          senderName: 'คุณ',
          senderAvatar: null
        }
        this.messages.push(mockMessage)
        this.newMessage = ''

        this.$nextTick(() => {
          this.scrollToBottom()
        })

        // TODO: Emit socket event
        // this.$socket.emit('dm-message', messageData)
      } catch (error) {
        console.error('Error sending DM:', error)
      }
    },
    scrollToBottom () {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    },
    getInitials (name) {
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

.loading-messages,
.empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: rgba(246, 243, 237, 0.6);
}

.empty-messages i {
  font-size: 44px;
  margin-bottom: 12px;
  opacity: 0.5;
  color: var(--violet);
}

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

<!-- b-modal chrome is teleported outside this component's DOM, so it
     needs an unscoped block, matching RoomSettings.vue's approach. -->
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

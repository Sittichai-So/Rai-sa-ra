// components/DirectMessageModal.vue
<template>
  <b-modal
    v-model="showModal"
    size="lg"
    :title="`แชทกับ ${friendName}`"
    @hidden="closeModal"
    body-class="dm-modal-body"
    header-class="dm-modal-header"
  >
    <div class="dm-chat-container">
      <!-- Messages Area -->
      <div class="dm-messages" ref="messagesContainer">
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
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อความ...
        </div>

        <!-- Empty state -->
        <div v-if="!loading && messages.length === 0" class="empty-messages">
          <i class="fas fa-comments"></i>
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
            @keyup.enter="sendMessage"
            class="message-input"
          >
          <button
            class="send-btn"
            :disabled="!newMessage.trim()"
            @click="sendMessage"
          >
            <i class="fas fa-paper-plane"></i>
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
  data() {
    return {
      showModal: false,
      messages: [],
      newMessage: '',
      loading: false
    }
  },
  computed: {
    friendName() {
      return this.friend ? this.friend.displayName || this.friend.fullname : ''
    }
  },
  watch: {
    friend(newFriend) {
      if (newFriend) {
        this.loadMessages()
      }
    }
  },
  methods: {
    open() {
      this.showModal = true
      this.loadMessages()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    closeModal() {
      this.showModal = false
      this.messages = []
      this.newMessage = ''
    },
    async loadMessages() {
      if (!this.friend) return

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
    async sendMessage() {
      if (!this.newMessage.trim() || !this.friend) return

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
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    },
    getInitials(name) {
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },
    formatTime(date) {
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
.dm-modal-body {
  padding: 0;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.dm-modal-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.dm-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
}

.dm-message {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.dm-message.own-message {
  flex-direction: row-reverse;
}

.dm-message.own-message .message-content {
  margin-left: 0;
  margin-right: 10px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.message-content {
  margin-left: 10px;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.sender-name {
  font-weight: bold;
  font-size: 14px;
  color: #495057;
}

.message-time {
  font-size: 12px;
  color: #6c757d;
  margin-left: 8px;
}

.message-text {
  background: white;
  padding: 10px 15px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-wrap: break-word;
}

.own-message .message-text {
  background: #007bff;
  color: white;
}

.loading-messages,
.empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-messages i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.dm-input-area {
  border-top: 1px solid #dee2e6;
  padding: 15px;
  background: white;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
}

.message-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>
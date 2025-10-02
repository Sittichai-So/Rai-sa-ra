<!-- room.vue -->
<template>
  <div class="chat-room-page d-flex" style="height: 100vh;">
    <div class="d-flex flex-column flex-grow-1">
      <header class="bg-dark text-white p-2 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          ห้องแชท {{ currentRoom.name || roomId }}
        </h5>
        <nuxt-link to="/chat/chat" class="btn btn-warning btn-sm" @click.prevent="goBack">
          <i class="fas fa-arrow-left mr-1" /> กลับ
        </nuxt-link>
      </header>

      <MessageList
        ref="chatContainer"
        class="flex-grow-1"
        :messages="messages"
        :current-user-id="currentUserId"
        :typing-users="typingUsers"
        @toggle-reaction="handleToggleReaction"
        @add-reaction="handleAddReaction"
        @reply-to="handleReplyTo"
        @edit-message="handleEditMessage"
        @delete-message="handleDeleteMessage"
        @load-more="loadMoreMessages"
      />

      <TypingIndicator :typing-users="typingUsers" class="px-3 mb-1" />

      <MessageInput
        ref="messageInput"
        :reply-to="replyTo"
        @send-message="sendMessage"
        @cancel-reply="cancelReply"
      />
    </div>
    <aside style="width: 250px;">
      <DiscordMemberList :room-id="roomId" :current-user-id="currentUserId" />
    </aside>

    <b-modal
      id="reaction-picker-modal"
      v-model="showReactionPicker"
      title="เลือกรีแอคชั่น"
      size="sm"
      centered
      hide-footer
    >
      <div class="reaction-picker-grid">
        <button
          v-for="emoji in emojiList"
          :key="emoji"
          class="emoji-btn"
          @click="selectReaction(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import MessageList from '~/components/MessageList.vue'
import MessageInput from '~/components/MessageInput.vue'
import DiscordMemberList from '~/components/MemberList.vue'
import TypingIndicator from '~/components/TypingIndicator.vue'

export default {
  components: { MessageList, MessageInput, DiscordMemberList, TypingIndicator },
  data () {
    return {
      roomId: this.$route.params.id || this.$route.query.id,
      currentRoom: {
        name: this.$route.query?.name || this.$route.params.name || '',
        category: this.$route.query?.category || '',
        description: this.$route.query?.description || '',
        memberCount: parseInt(this.$route.query?.memberCount) || 1,
        tags: this.$route.query?.tags ? JSON.parse(this.$route.query.tags) : [],
        status: this.$route.query?.status || 'online'
      },
      messages: [],
      typingUsers: [],
      user: null,
      replyTo: null,
      showReactionPicker: false,
      selectedMessageId: null,
      emojiList: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '✅', '❌', '⭐'],
      page: 1,
      hasMore: true
    }
  },
  computed: {
    currentUserId () {
      return this.user?._id || ''
    }
  },
  watch: {
    messages () {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer?.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }
  },
  async mounted () {
    this.loadUserData()
    if (!this.roomId) { return }

    await this.fetchMessages()
    this.setupSocketListeners()
  },
  beforeDestroy () {
    if (this.$socket) {
      this.$socket.off('receiveMessage')
      this.$socket.off('messageReaction')
      this.$socket.off('messageDeleted')
      this.$socket.off('messageEdited')
      this.$socket.emit('leaveRoom', { roomId: this.roomId, user: this.user })
    }
  },
  methods: {
    loadUserData () {
      if (process.client) {
        const storedUser = localStorage.getItem('userData')
        this.user = storedUser
          ? JSON.parse(storedUser)
          : { _id: 'guest', fullname: 'Guest', status: 'offline' }
      }
    },

    async fetchMessages () {
      try {
        if (!this.roomId) { return }

        const res = await this.$axios.$get(
          `${process.env.API_GET_CHATLOG_ROOM_ID}/${this.roomId}/messages`,
          { params: { page: 1, limit: 50 } }
        )

        const data = res.result || res.messages || []
        this.messages = Array.isArray(data) ? data.map(msg => this.formatMessage(msg)) : []

        this.hasMore = res.hasMore || false
      } catch (err) {
        console.error('โหลดข้อความไม่สำเร็จ', err)
        this.$bvToast.toast('ไม่สามารถโหลดข้อความได้', {
          variant: 'danger',
          solid: true
        })
      }
    },

    async loadMoreMessages () {
      if (!this.hasMore) { return }

      try {
        this.page++
        const res = await this.$axios.$get(
          `${process.env.API_GET_CHATLOG_ROOM_ID}/${this.roomId}/messages`,
          { params: { page: this.page, limit: 50 } }
        )

        const oldMessages = (res.messages || res || []).map(msg => this.formatMessage(msg))
        this.messages = [...oldMessages, ...this.messages]
        this.hasMore = res.hasMore || false
      } catch (err) {
        console.error('โหลดข้อความเพิ่มเติมไม่สำเร็จ', err)
      }
    },

    setupSocketListeners () {
      this.$socket.emit('joinRoom', { roomId: this.roomId, user: this.user })

      this.$socket.on('receiveMessage', (msg) => {
        const formatted = this.formatMessage(msg)
        this.messages.push(formatted)
      })

      this.$socket.on('messageReaction', ({ messageId, reactions }) => {
        const message = this.messages.find(m => m._id === messageId)
        if (message) {
          this.$set(message, 'reactions', reactions)
        }
      })

      this.$socket.on('messageDeleted', ({ messageId }) => {
        const index = this.messages.findIndex(m => m._id === messageId)
        if (index !== -1) {
          this.messages.splice(index, 1)
        }
      })

      this.$socket.on('messageEdited', ({ messageId, content }) => {
        const message = this.messages.find(m => m._id === messageId)
        if (message) {
          message.content = content
          message.edited = true
        }
      })
    },

    formatMessage (msg) {
      return {
        _id: msg._id,
        content: msg.text || msg.content,
        username: msg.username || msg.user?.username || 'Unknown',
        fullName: `${msg.user?.firstName || ''} ${msg.user?.lastName || ''}`.trim() || msg.username,
        avatar: msg.avatar || msg.user?.avatar || null,
        userId: msg.userId || msg.user?._id,
        createdAt: msg.timestamp || msg.createdAt || new Date(),
        type: msg.type || 'text',
        replyTo: msg.replyTo || null,
        reactions: msg.reactions || [],
        status: msg.status || 'sent',
        edited: msg.edited || false
      }
    },

    sendMessage (messageData) {
      const payload = {
        roomId: this.roomId,
        message: messageData.content,
        user: this.user,
        type: messageData.type || 'text'
      }

      if (this.replyTo) {
        payload.replyTo = {
          _id: this.replyTo._id,
          username: this.replyTo.username,
          content: this.replyTo.content
        }
      }

      this.$socket.emit('sendMessage', payload)
      this.cancelReply()
    },

    handleToggleReaction ({ messageId, emoji }) {
      this.$socket.emit('toggleReaction', {
        roomId: this.roomId,
        messageId,
        emoji,
        userId: this.currentUserId,
        username: this.user?.username || 'Unknown'
      })
    },

    handleAddReaction (messageId) {
      this.selectedMessageId = messageId
      this.showReactionPicker = true
    },

    selectReaction (emoji) {
      if (this.selectedMessageId) {
        this.handleToggleReaction({
          messageId: this.selectedMessageId,
          emoji
        })
      }
      this.showReactionPicker = false
      this.selectedMessageId = null
    },

    handleReplyTo (message) {
      this.replyTo = {
        _id: message._id,
        username: message.username,
        content: message.content
      }
      this.$nextTick(() => {
        this.$refs.messageInput?.focusInput()
      })
    },

    cancelReply () {
      this.replyTo = null
    },

    handleEditMessage (message) {
      this.$bvToast.toast('ฟีเจอร์แก้ไขข้อความกำลังพัฒนา', {
        variant: 'info',
        solid: true
      })
    },

    async handleDeleteMessage (messageId) {
      const confirmed = await this.$bvModal.msgBoxConfirm('คุณต้องการลบข้อความนี้หรือไม่?', {
        title: 'ยืนยันการลบ',
        okVariant: 'danger',
        okTitle: 'ลบ',
        cancelTitle: 'ยกเลิก',
        centered: true
      })

      if (confirmed) {
        this.$socket.emit('deleteMessage', {
          roomId: this.roomId,
          messageId,
          userId: this.currentUserId
        })
      }
    },

    scrollToBottom () {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer?.$el || this.$refs.chatContainer
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },

    goBack () {
      this.$router.push('/chat/chat')
    }
  }
}
</script>

<style scoped>
.chat-room-page {
  background: #f8f9fa;
  overflow: hidden;
}

header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

aside {
  border-left: 1px solid #dee2e6;
  background: white;
  overflow-y: auto;
}

.reaction-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 10px;
}

.emoji-btn {
  font-size: 28px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.emoji-btn:hover {
  transform: scale(1.2);
  border-color: #007bff;
  background: #f8f9fa;
}

.emoji-btn:active {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .chat-room-page aside {
    display: none;
  }

  .reaction-picker-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

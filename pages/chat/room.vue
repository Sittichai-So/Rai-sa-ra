// pages/chat/room.vue
<template>
  <div
    class="chat-room-page d-flex"
    :data-theme="chatTheme"
    :style="{
      height: '100vh',
      background: chatBackground.startsWith('http')
        ? `url(${chatBackground}) center/cover no-repeat`
        : chatBackground || '#f8f9fa'
    }"
  >
    <!-- Main Chat Section -->
    <div class="d-flex flex-column flex-grow-1">
      <header class="bg-dark text-white p-2 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          ห้องแชท {{ currentRoom.name || roomId }}
        </h5>
        <div class="d-flex align-items-center gap-2">
          <button
            v-if="currentRoom.type === 'private'"
            class="btn btn-outline-light btn-sm"
            @click="openSettings"
          >
            <i class="fas fa-cog mr-1" /> ตั้งค่า
          </button>
          <nuxt-link to="/chat/chat" class="btn btn-warning btn-sm" @click.prevent="goBack">
            <i class="fas fa-arrow-left mr-1" /> กลับ
          </nuxt-link>
        </div>
      </header>

      <MessageList
        ref="chatContainer"
        class="flex-grow-1"
        :messages="messages"
        :current-user-id="currentUserId"
        :typing-users="typingUsers"
        :chat-theme="chatTheme"
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

    <!-- Member List -->
    <aside style="width: 250px;">
      <DiscordMemberList :room-id="roomId" :current-user-id="currentUserId" :chat-theme="chatTheme" />
    </aside>

    <!-- Reaction Picker -->
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

    <!-- Room Settings Modal -->
    <RoomSettings
      :show="showSettingsModal"
      :value="{ theme: chatTheme, background: chatBackground }"
      :available-themes="availableThemes"
      @save="handleSettingsSave"
      @close="showSettingsModal = false"
    />
  </div>
</template>

<script>
import MessageList from '~/components/MessageList.vue'
import MessageInput from '~/components/MessageInput.vue'
import DiscordMemberList from '~/components/MemberList.vue'
import TypingIndicator from '~/components/TypingIndicator.vue'
import RoomSettings from '~/components/RoomSettings.vue'

export default {
  components: {
    MessageList,
    MessageInput,
    DiscordMemberList,
    TypingIndicator,
    RoomSettings
  },
  data () {
    return {
      roomId: this.$route.params.id || this.$route.query.id,
      currentRoom: {
        name: this.$route.query?.name || this.$route.params.name || '',
        category: this.$route.query?.category || '',
        description: this.$route.query?.description || '',
        memberCount: parseInt(this.$route.query?.memberCount) || 1,
        tags: this.$route.query?.tags ? JSON.parse(this.$route.query.tags) : [],
        status: this.$route.query?.status || 'online',
        type: this.$route.query?.type || 'public'
      },
      messages: [],
      typingUsers: [],
      user: null,
      replyTo: null,
      showReactionPicker: false,
      selectedMessageId: null,
      emojiList: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '✅', '❌', '⭐'],
      page: 1,
      hasMore: true,

      showSettingsModal: false,
      chatTheme: 'minimal',
      chatBackground: '#0f0f23',

      availableThemes: [
        {
          id: 'default',
          name: 'ธีมเริ่มต้น',
          description: 'สีน้ำเงินและเทาคลาสสิก',
          ownBubble: '#0084ff',
          otherBubble: '#f0f0f0'
        },
        {
          id: 'purple',
          name: 'ม่วงพาสเทล',
          description: 'สีม่วงนุ่มนวล',
          ownBubble: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          otherBubble: '#f3e5f5'
        },
        {
          id: 'pink',
          name: 'ชมพูหวาน',
          description: 'สีชมพูสดใส',
          ownBubble: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          otherBubble: '#fce4ec'
        },
        {
          id: 'green',
          name: 'เขียวสดชื่น',
          description: 'สีเขียวธรรมชาติ',
          ownBubble: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          otherBubble: '#e8f5e9'
        },
        {
          id: 'orange',
          name: 'ส้มสดใส',
          description: 'สีส้มอบอุ่น',
          ownBubble: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          otherBubble: '#fff3e0'
        },
        {
          id: 'dark',
          name: 'ธีมมืด',
          description: 'สีเข้มสไตล์โมเดิร์น',
          ownBubble: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
          otherBubble: '#37474f'
        },
        {
          id: 'minimal',
          name: 'ธีมมินิมอล',
          description: 'สีเรียบง่าย สไตล์มินิมอล',
          ownBubble: '#ffffff',
          otherBubble: '#f8f9fa'
        }
      ]
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
        if (el) { el.scrollTop = el.scrollHeight }
      })
    }
  },
  async mounted () {
    this.loadUserData()
    this.loadRoomSettings()

    if (!this.roomId) { return }

    // Animate page entrance
    this.$anime({
      targets: '.chat-room-page',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutQuad'
    })

    this.$anime({
      targets: 'header',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 400,
      delay: 200,
      easing: 'easeOutQuad'
    })

    this.$anime({
      targets: 'aside',
      opacity: [0, 1],
      translateX: [20, 0],
      duration: 400,
      delay: 400,
      easing: 'easeOutQuad'
    })

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

    loadRoomSettings () {
      if (process.client) {
        const settings = localStorage.getItem(`room_settings_${this.roomId}`)
        if (settings) {
          const parsed = JSON.parse(settings)
          this.chatTheme = parsed.theme || 'minimal'
          this.chatBackground = parsed.background || '#ffffff'
        } else {
          this.chatTheme = 'minimal'
          this.chatBackground = '#ffffff'
        }
      }
    },

    saveRoomSettings () {
      if (process.client) {
        const settings = {
          theme: this.chatTheme,
          background: this.chatBackground
        }
        localStorage.setItem(`room_settings_${this.roomId}`, JSON.stringify(settings))
      }
    },

    openSettings () {
      this.showSettingsModal = true
    },

    handleSettingsSave (settings) {
      this.chatTheme = settings.theme
      this.chatBackground = settings.background
      this.saveRoomSettings()
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
        this.messages.push(this.formatMessage(msg))
      })
      this.$socket.on('messageReaction', ({ messageId, reactions }) => {
        const message = this.messages.find(m => m._id === messageId)
        if (message) { this.$set(message, 'reactions', reactions) }
      })
      this.$socket.on('messageDeleted', ({ messageId }) => {
        const index = this.messages.findIndex(m => m._id === messageId)
        if (index !== -1) { this.messages.splice(index, 1) }
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

    handleEditMessage () {
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

    goBack () {
      this.$router.push('/chat/chat')
    }
  }
}
</script>

<style scoped>
.chat-room-page {
  overflow: hidden;
  transition: background 0.4s ease, transform 0.4s ease;
  position: relative;
}

.chat-room-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.14), transparent 20%),
              radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.1), transparent 18%);
  pointer-events: none;
  z-index: 0;
}

.chat-room-page > div,
.chat-room-page aside,
.chat-room-page .b-modal {
  position: relative;
  z-index: 1;
}

header {
  background: rgba(15, 23, 42, 0.96);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

header .btn {
  border-radius: 999px;
}

header .btn-warning {
  background: #f59e0b;
  border-color: #d97706;
}

header .btn-warning:hover {
  background: #d97706;
}

aside {
  width: 280px;
  border-left: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.93);
  overflow-y: auto;
  min-height: 100%;
}

aside::-webkit-scrollbar,
.chat-room-page .b-modal::-webkit-scrollbar {
  width: 8px;
}

aside::-webkit-scrollbar-track,
.chat-room-page .b-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
}

aside::-webkit-scrollbar-thumb,
.chat-room-page .b-modal::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.4);
  border-radius: 999px;
}

.reaction-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(40px, 1fr));
  gap: 10px;
  padding: 14px;
}

.emoji-btn {
  font-size: 24px;
  padding: 14px;
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.emoji-btn:hover {
  transform: scale(1.1);
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.18);
}

@media (max-width: 992px) {
  .chat-room-page {
    flex-direction: column;
  }

  aside {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }
}

@media (max-width: 640px) {
  header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  header h5 {
    font-size: 1rem;
  }

  .reaction-picker-grid {
    grid-template-columns: repeat(4, minmax(40px, 1fr));
  }
}
</style>

<template>
  <div class="chat-layout">
    <aside class="chat-sidebar">
      <h3 class="sidebar-title">
        ห้องของคุณ
      </h3>
      <ul>
        <li :class="{ active: true }">
          <span># ห้องชั่วคราว</span>
        </li>
      </ul>
    </aside>

    <section class="chat-main">
      <header class="chat-header">
        <h2># {{ currentRoom?.name || `ห้อง ${roomId}` }}</h2>
      </header>

      <MessageList
        :messages="validatedMessages"
        :current-user-id="user._id"
        :typing-users="typingUsers"
        :loading-more="loadingMore"
        class="chat-messages"
        @load-more="loadMoreMessages"
        @toggle-reaction="handleToggleReaction"
        @add-reaction="handleAddReaction"
        @reply-to="handleReplyTo"
        @edit-message="handleEditMessage"
        @delete-message="handleDeleteMessage"
      />

      <TypingIndicator v-if="isTyping" />

      <MessageInput
        ref="messageInput"
        @send="sendMessage"
        @typing="notifyTyping"
      />

      <EmojiPicker
        v-if="showEmoji"
        @select="addEmoji"
        @close="showEmoji = false"
      />
    </section>

    <aside class="chat-members">
      <h3 class="members-title">
        สมาชิก
      </h3>
      <MemberList
        :members="members"
        :current-user-id="user._id"
        :room-id="roomId"
      />
    </aside>
  </div>
</template>

<script>
import MessageList from '~/components/MessageList.vue'
import MessageInput from '~/components/MessageInput.vue'
import MemberList from '~/components/MemberList.vue'
import EmojiPicker from '~/components/EmojiPicker.vue'
import TypingIndicator from '~/components/TypingIndicator.vue'

export default {
  components: {
    MessageList,
    MessageInput,
    MemberList,
    EmojiPicker,
    TypingIndicator
  },
  data () {
    const roomId = this.$route?.query?.id || 'temp-room'
    const roomName = this.$route?.query?.name || `ห้อง ${roomId}`
    const roomCategory = this.$route?.query?.category || ''
    const roomDescription = this.$route?.query?.description || ''
    const memberCount = parseInt(this.$route?.query?.memberCount) || 1
    const roomTags = this.$route?.query?.tags ? JSON.parse(this.$route?.query?.tags) : []
    const roomStatus = this.$route?.query?.status || 'online'
    const justJoined = this.$route?.query?.justJoined === 'true'

    let user = { _id: 'guest', fullname: 'Guest User' }
    if (process.client) {
      try {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
          user = JSON.parse(storedUser)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    return {
      roomId,
      currentRoom: {
        _id: roomId,
        name: roomName,
        category: roomCategory,
        description: roomDescription,
        memberCount,
        tags: roomTags,
        status: roomStatus
      },
      justJoined,
      loginData: null,
      isLogin: false,
      token: null,
      messages: [
        {
          _id: 1,
          userId: 'Rai-Sa-Ra',
          username: 'Rai-Sa-Ra',
          content: justJoined
            ? `ยินดีต้อนรับสู่ห้อง ${roomName}! 🎉`
            : 'ยินดีต้อนรับสู่ห้องแชท!',
          type: 'text',
          createdAt: new Date().toISOString(),
          status: 'sent',
          reactions: []
        }
      ],
      members: [
        {
          userId: user._id,
          fullname: user.fullname,
          avatar: '',
          status: 'online'
        }
      ],
      showEmoji: false,
      user,
      isTyping: false,
      typingUsers: [],
      loadingMore: false,
      reactionTargetMessageId: null
    }
  },

  computed: {
    validatedMessages () {
      if (!Array.isArray(this.messages)) {
        return []
      }

      return this.messages.map((message) => {
        const validatedMessage = {
          _id: message._id || Date.now() + Math.random(),
          userId: message.userId || 'unknown',
          username: message.username || 'Unknown User',
          content: message.content || '',
          type: message.type || 'text',
          createdAt: this.getValidDate(message.createdAt),
          status: message.status || 'sent',
          reactions: Array.isArray(message.reactions) ? message.reactions : [],
          avatar: message.avatar || null,
          fileName: message.fileName || null,
          fileUrl: message.fileUrl || null,
          fileSize: message.fileSize || null
        }

        return validatedMessage
      })
    }
  },

  watch: {
    '$route.query': {
      handler (newQuery, oldQuery) {
        if (newQuery.id && newQuery.id !== this.roomId) {
          this.roomId = newQuery.id
          this.currentRoom = {
            _id: newQuery.id,
            name: newQuery.name || `ห้อง ${newQuery.id}`,
            category: newQuery.category || '',
            description: newQuery.description || '',
            memberCount: parseInt(newQuery.memberCount) || 1,
            tags: newQuery.tags ? JSON.parse(newQuery.tags) : [],
            status: newQuery.status || 'online'
          }
          if (newQuery.justJoined === 'true') {
            this.messages.unshift({
              _id: Date.now(),
              userId: 'Rai-Sa-Ra',
              username: 'Rai-Sa-Ra',
              content: `คุณได้เข้าร่วมห้อง ${this.currentRoom.name} แล้ว! 🎉`,
              type: 'system',
              createdAt: new Date().toISOString(),
              status: 'sent',
              reactions: []
            })
            this.loadRoomData()
          }
        }
      },
      immediate: true
    }
  },

  async mounted () {
    this.initialize()
    await this.setToken()
    this.startSessionTimeout()

    await this.loadRecentMessages()

    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 200)
    })
  },

  methods: {
    initialize () {
      const storedLoginData = JSON.parse(localStorage.getItem('userData'))
      if (storedLoginData) {
        this.loginData = storedLoginData
        this.isLogin = true
      }
    },

    async setToken () {
      try {
        this.token = localStorage.getItem('token')
        if (this.token) {
          this.$axios.setToken(this.token, 'Bearer')
          this.isLogin = true
        } else {
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Error:', error)
        await this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด'
        })
      }
    },

    startSessionTimeout () {
      setTimeout(() => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('userData')

        this.$swal({
          icon: 'warning',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่'
        }).then(() => {
          this.$router.push('/')
        })
      }, 30 * 60 * 1000)
    },
    async loadRecentMessages () {
      try {
        const apiUrl = process.env.API_GET_ROOMID_MESSAGE.replace(':roomId', this.roomId)
        const response = await this.$axios.$get(apiUrl, {
          params: {
            offset: 0,
            limit: 50
          }
        })

        if (response.status === 'success' && response.result) {
          const systemMessages = this.messages.filter(msg => msg.userId === 'Rai-Sa-Ra')
          this.messages = [...systemMessages, ...response.result]

          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    },

    async sendMessage (content) {
      if (!content || !content.trim()) { return }

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        userId: this.user._id,
        username: this.user.fullname,
        content: content.trim(),
        type: 'text',
        createdAt: new Date().toISOString(),
        status: 'sending',
        reactions: [],
        avatar: this.user.avatar || null
      }

      this.messages.push(tempMessage)
      this.scrollToBottom()

      try {
        const apiUrl = process.env.API_SENT_MESSAGE.replace(':roomId', this.roomId)
        const response = await this.$axios.$post(apiUrl, {
          content: content.trim(),
          type: 'text'
        })

        if (response.status === 'success') {
          const messageIndex = this.messages.findIndex(msg => msg._id === tempMessage._id)
          if (messageIndex !== -1) {
            this.messages[messageIndex] = {
              ...response.result,
              status: 'sent'
            }
          }

          setTimeout(() => {
            const msgIndex = this.messages.findIndex(msg => msg._id === response.result._id)
            if (msgIndex !== -1) {
              this.messages[msgIndex].status = 'delivered'
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Error sending message:', error)

        const messageIndex = this.messages.findIndex(msg => msg._id === tempMessage._id)
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'error'
        }

        this.$toast.error('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่')
      }
    },
    async loadMoreMessages () {
      this.loadingMore = true

      try {
        const currentMessageCount = this.messages.filter(msg => msg.userId !== 'Rai-Sa-Ra').length
        const apiUrl = process.env.API_GET_ROOMID_MESSAGE.replace(':roomId', this.roomId)

        const response = await this.$axios.$get(apiUrl, {
          params: {
            offset: currentMessageCount,
            limit: 20
          }
        })

        if (response.status === 'success' && response.result && response.result.length > 0) {
          const systemMessages = this.messages.filter(msg => msg.userId === 'Rai-Sa-Ra')
          const existingMessages = this.messages.filter(msg => msg.userId !== 'Rai-Sa-Ra')

          this.messages = [...systemMessages, ...response.result, ...existingMessages]
        }
      } catch (error) {
        console.error('Error loading more messages:', error)
      } finally {
        this.loadingMore = false
      }
    },

    async handleEditMessage (message) {
      try {
        const { value: newContent } = await this.$swal({
          title: 'แก้ไขข้อความ',
          input: 'textarea',
          inputValue: message.content,
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก'
        })

        if (newContent && newContent.trim() !== message.content) {
          const apiUrl = process.env.API_UPDATE_MESSAGE.replace(':messageId', message._id)
          const response = await this.$axios.$put(apiUrl, {
            content: newContent.trim()
          })

          if (response.status === 'success') {
            const messageIndex = this.messages.findIndex(msg => msg._id === message._id)
            if (messageIndex !== -1) {
              this.messages[messageIndex] = {
                ...this.messages[messageIndex],
                content: newContent.trim(),
                isEdited: true,
                editedAt: new Date().toISOString()
              }
            }

            this.$toast.success('แก้ไขข้อความสำเร็จ')
          }
        }
      } catch (error) {
        console.error('Error editing message:', error)
        this.$toast.error('ไม่สามารถแก้ไขข้อความได้')
      }
    },
    async handleDeleteMessage (messageId) {
      try {
        const result = await this.$swal({
          title: 'ยืนยันการลบ',
          text: 'คุณแน่ใจหรือไม่ที่จะลบข้อความนี้?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ลบ',
          cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
          const apiUrl = process.env.API_DELETE_MESSAGE.replace(':messageId', messageId)
          const response = await this.$axios.$delete(apiUrl)

          if (response.status === 'success') {
            const messageIndex = this.messages.findIndex(msg => msg._id === messageId)
            if (messageIndex !== -1) {
              this.messages.splice(messageIndex, 1)
            }

            this.$toast.success('ลบข้อความสำเร็จ')
          }
        }
      } catch (error) {
        console.error('Error deleting message:', error)
        this.$toast.error('ไม่สามารถลบข้อความได้')
      }
    },

    async searchMessages (query) {
      if (!query || query.trim().length < 2) {
        return
      }

      try {
        const apiUrl = process.env.API_SEARCH_MESSAGE.replace(':roomId', this.roomId)
        const response = await this.$axios.$get(apiUrl, {
          params: {
            q: query.trim()
          }
        })

        if (response.status === 'success') {
          console.log('Search results:', response.result)
          return response.result
        }
      } catch (error) {
        console.error('Error searching messages:', error)
        this.$toast.error('ไม่สามารถค้นหาข้อความได้')
      }
    },

    notifyTyping () {
      this.isTyping = true
      setTimeout(() => {
        this.isTyping = false
      }, 2000)
    },

    addEmoji (emoji) {
      if (this.reactionTargetMessageId) {
        this.handleToggleReaction({
          messageId: this.reactionTargetMessageId,
          emoji
        })
        this.reactionTargetMessageId = null
        this.showEmoji = false
      } else if (this.$refs.messageInput && this.$refs.messageInput.insertEmoji) {
        this.$refs.messageInput.insertEmoji(emoji)
        this.showEmoji = false
      }
    },

    scrollToBottom () {
      this.$nextTick(() => {
        try {
          const messagesContainer = this.$el?.querySelector?.('.message-list-container .message-list')
          if (messagesContainer && typeof messagesContainer.scrollHeight === 'number') {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
          }
        } catch (error) {
          console.error('Error scrolling to bottom:', error)
        }
      })
    },

    handleToggleReaction (payload) {
      const { messageId, emoji } = payload
      const messageIndex = this.messages.findIndex(msg => msg._id === messageId)
      if (messageIndex !== -1) {
        const message = this.messages[messageIndex]
        const existingReaction = message.reactions.find(r => r.emoji === emoji && r.userId === this.user._id)

        if (existingReaction) {
          message.reactions = message.reactions.filter(r => !(r.emoji === emoji && r.userId === this.user._id))
        } else {
          message.reactions.push({
            emoji,
            userId: this.user._id,
            username: this.user.fullname
          })
        }

        this.$forceUpdate()
      }
    },

    handleAddReaction (messageId) {
      this.showEmoji = true
      this.reactionTargetMessageId = messageId
    },

    handleReplyTo (message) {
      if (this.$refs.messageInput) {
        this.$refs.messageInput.setReplyTo(message)
      }
    },

    getValidDate (dateValue) {
      if (!dateValue) {
        return new Date().toISOString()
      }

      if (typeof dateValue === 'string' && !isNaN(new Date(dateValue).getTime())) {
        return dateValue
      }

      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue.toISOString()
      }

      if (typeof dateValue === 'number' && !isNaN(dateValue)) {
        return new Date(dateValue).toISOString()
      }

      return new Date().toISOString()
    }
  }
}
</script>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: 220px 1fr 250px;
  height: 100vh;
  background: #2f3136;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chat-sidebar {
  background: #202225;
  padding: 16px;
  border-right: 1px solid #40444b;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #b9bbbe;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.chat-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-sidebar li {
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: pointer;
  color: #96989d;
  transition: background-color 0.15s ease-out;
}

.chat-sidebar li:hover {
  background: #34373c;
  color: #dcddde;
}

.chat-sidebar li.active {
  background: #393c43;
  color: #ffffff;
}

.chat-main {
  display: flex;
  flex-direction: column;
  background: #36393f;
  min-width: 0;
}

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #40444b;
  flex-shrink: 0;
}

.chat-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  min-height: 0;
}

.chat-members {
  background: #2f3136;
  padding: 16px;
  border-left: 1px solid #40444b;
  overflow-y: auto;
}

.members-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #b9bbbe;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Responsive design */
@media (max-width: 768px) {
  .chat-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .chat-sidebar,
  .chat-members {
    display: none;
  }
}

/* Reply/Edit indicator styles */
.reply-edit-indicator {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid #40444b;
  padding: 8px 16px;
}

.reply-indicator, .edit-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(114, 137, 218, 0.1);
  border-left: 3px solid #7289da;
  padding: 8px 12px;
  border-radius: 4px;
  color: #dcddde;
  font-size: 14px;
}

.edit-indicator {
  background: rgba(250, 166, 26, 0.1);
  border-left-color: #faa61a;
}

.reply-content, .edit-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.reply-text, .edit-text {
  color: #dcddde;
}

.cancel-btn {
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: background-color 0.15s;
}

.cancel-btn:hover {
  background: rgba(79, 84, 92, 0.16);
  color: #dcddde;
}

.cancel-btn:focus {
  outline: none;
}
</style>

<template>
  <div class="chat-room-page d-flex" style="height: 100vh;">
    <div class="d-flex flex-column flex-grow-1">
      <header class="bg-dark text-white p-2 d-flex justify-content-between align-items-center">
        <h5>ห้องแชท {{ currentRoom.name || roomId }}</h5>
        <nuxt-link to="/chat/chat" class="btn btn-warning btn-sm" @click.prevent="goBack">
          ← กลับ
        </nuxt-link>
      </header>
      <MessageList
        ref="chatContainer"
        class="flex-grow-1"
        :messages="messages"
        :current-user-id="currentUserId"
        :typing-users="typingUsers"
      />
      <TypingIndicator :typing-users="typingUsers" class="px-3 mb-1" />
      <MessageInput @send-message="sendMessage" />
    </div>

    <aside style="width: 250px;">
      <DiscordMemberList :room-id="roomId" :current-user-id="currentUserId" />
    </aside>
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
        name: this.$route.query?.name || '',
        category: this.$route.query?.category || '',
        description: this.$route.query?.description || '',
        memberCount: parseInt(this.$route.query?.memberCount) || 1,
        tags: this.$route.query?.tags ? JSON.parse(this.$route.query.tags) : [],
        status: this.$route.query?.status || 'online'
      },
      messages: [],
      typingUsers: [],
      user: null,
      replyTo: null
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

    this.$socket.emit('joinRoom', { roomId: this.roomId, user: this.user })

    this.$socket.on('receiveMessage', (msg) => {
      const formatted = {
        _id: msg._id,
        content: msg.text || msg.content,
        username: msg.username || msg.user?.username || 'Unknown',
        fullName: `${msg.user?.firstName || ''} ${msg.user?.lastName || ''}`.trim() || msg.username,
        avatar: msg.avatar || msg.user?.avatar || null,
        userId: msg.userId || msg.user?._id,
        createdAt: msg.timestamp || msg.createdAt || new Date(),
        type: msg.type || 'text',
        replyTo: msg.replyTo || null
      }
      this.messages.push(formatted)
    })
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

        const res = await this.$axios.$get(`${process.env.API_GET_CHATLOG_ROOM_ID}/${this.roomId}/messages`)
        this.messages = (res || []).map(msg => ({
          _id: msg._id,
          content: msg.content || msg.text,
          username: msg.username,
          fullName: msg.fullName || msg.username,
          avatar: msg.avatar || null,
          userId: String(msg.userId),
          createdAt: msg.createdAt || msg.timestamp,
          type: msg.type || 'text',
          replyTo: msg.replyTo || null
        }))
      } catch (err) {
        console.error('โหลดข้อความไม่สำเร็จ', err)
      }
    },
    sendMessage (messageData) {
      this.$socket.emit('sendMessage', {
        roomId: this.roomId,
        message: messageData.content,
        user: this.user,
        replyTo: this.replyTo
      })
      this.replyTo = null
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer?.$el || this.$refs.chatContainer
        if (el) { el.scrollTop = el.scrollHeight }
      })
    },
    goBack () {
      this.$router.push('/chat/chat')
    }
  }
}
</script>

<template>
  <div class="chat-room-page d-flex" style="height: 100vh;">
    <div class="d-flex flex-column flex-grow-1">
      <header class="bg-dark text-white p-2 d-flex justify-content-between align-items-center">
        <h5 class="m-0">
          ห้องแชท {{ currentRoom.name || `ห้อง ${roomId}` }}
        </h5>
        <nuxt-link
          to="/chat/chat"
          class="btn btn-warning btn-sm"
          @click.prevent="goBack"
        >
          ← กลับ
        </nuxt-link>
      </header>

      <MessageList
        ref="chatContainer"
        :messages="messages"
        :current-user-id="user && user._id ? user._id : ''"
        :typing-users="typingUsers"
      />

      <TypingIndicator :typing-users="typingUsers" class="px-3 mb-1" />

      <footer class="p-2 border-top">
        <div class="d-flex align-items-center">
          <MessageInput
            ref="msgInput"
            class="flex-grow-1"
            @send-message="sendMessage"
          />
        </div>
      </footer>
    </div>

    <aside class="border-left bg-light p-2">
      <DiscordMemberList
        :room-id="roomId"
        :current-user-id="currentUserId"
      />
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
  middleware: 'middlewareAuth',
  data () {
    return {
      roomId: this.$route.params.id || this.$route.params.roomId || this.$route.query.id,
      currentRoom: {
        name: this.$route?.query?.name,
        category: this.$route?.query?.category || '',
        description: this.$route?.query?.description || '',
        memberCount: parseInt(this.$route?.query?.memberCount) || 1,
        tags: this.$route?.query?.tags ? JSON.parse(this.$route?.query?.tags) : [],
        status: this.$route?.query?.status || 'online'
      },
      messages: [],
      typingUsers: [],
      members: [],
      user: null,
      replyTo: null
    }
  },
  computed: {
    currentUserId () {
      return this.user && this.user._id ? String(this.user._id) : ''
    },
    userStatus () {
      if (process.client) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        return userData.status || 'offline'
      }
      return this.user?.status || 'offline'
    },
    userStatusText () {
      return this.userStatus === 'online' ? 'ออนไลน์' : 'ออฟไลน์'
    },
    statusIndicatorClass () {
      return {
        'status-online': this.userStatus === 'online',
        'status-offline': this.userStatus === 'offline'
      }
    }
  },
  mounted () {
    console.log('🔍 Route params:', this.$route.params)
    console.log('🔍 Route query:', this.$route.query)
    console.log('🔍 Route path:', this.$route.path)
    console.log('🔍 roomId value:', this.roomId)

    this.loadUserData()

    if (!this.roomId) {
      console.error('❌ roomId is missing from route params')
      const pathSegments = this.$route.path.split('/')
      const possibleRoomId = pathSegments[pathSegments.length - 1]
      if (possibleRoomId && possibleRoomId !== 'room') {
        this.roomId = possibleRoomId
        console.log('✅ Using roomId from path:', this.roomId)
      } else {
        return
      }
    }

    this.$socket.emit('joinRoom', {
      roomId: this.roomId,
      user: {
        ...this.user,
        status: this.userStatus
      }
    })

    this.$socket.on('receiveMessage', (msg) => {
      const formatted = {
        _id: msg._id || Date.now().toString(),
        userId: msg.user?._id || 'unknown',
        username: msg.user?.fullname || 'ไม่ทราบชื่อ',
        avatar: msg.user?.avatar || null,
        content: msg.message,
        type: msg.type || 'text',
        createdAt: msg.createdAt || new Date().toISOString(),
        files: msg.files || [],
        replyTo: msg.replyTo || null,
        status: 'sent'
      }
      this.messages.push(formatted)
      this.scrollToBottom()
    })

    // ลบ roomMembers listener ออก เพราะ DiscordMemberList จะจัดการเอง
    // this.$socket.on('roomMembers', (members) => {
    //   this.members = members
    // })

    this.$socket.on('userStatusChanged', (data) => {
      if (data.userId === this.currentUserId) {
        if (this.$store && this.$store.commit) {
          this.$store.commit('setUserStatus', data.status)
        }
      }
    })
    window.addEventListener('beforeunload', () => {
      if (this.$socket && this.user?._id) {
        this.$socket.emit('statusChanged', {
          roomId: this.roomId,
          userId: this.user._id,
          status: 'offline'
        })
      }
    })
  },
  methods: {
    async goBack () {
      try {
        this.$Notiflix.Loading()

        if (this.$socket && this.user?._id) {
          this.$socket.emit('statusChanged', {
            roomId: this.roomId,
            userId: this.user._id,
            status: 'offline'
          })
          this.user.status = 'offline'

          if (process.client) {
            localStorage.setItem('userData', JSON.stringify(this.user))
          }
          await new Promise(resolve => setTimeout(resolve, 150))
        }
      } catch (error) {
        console.error('Error:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาลองอีกครั้งหรือติดต่อเจ้าหน้าที่',
          confirmButtonText: 'ปิด'
        })
      } finally {
        this.$Notiflix.Loading.remove()
        this.$router.push('/chat/chat')
      }
    },
    loadUserData () {
      if (process.client) {
        const storedUser = localStorage.getItem('userData')
        this.user = storedUser ? JSON.parse(storedUser) : { _id: 'guest', fullname: 'Guest', status: 'offline' }
        this.user.status = this.userStatus
      }
    },
    sendMessage (messageData) {
      this.$socket.emit('sendMessage', {
        roomId: this.roomId,
        message: messageData.content,
        files: messageData.files,
        user: {
          ...this.user,
          status: this.userStatus
        },
        replyTo: this.replyTo
      })
      this.replyTo = null
    },
    setReply (message) {
      this.replyTo = message
      const input = this.$refs.msgInput
      if (input && input.focusInput) { input.focusInput() }
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer?.$el || this.$refs.chatContainer
        if (el) { el.scrollTop = el.scrollHeight }
      })
    }
  }
}
</script>

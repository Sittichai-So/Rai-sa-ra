<template>
  <div class="chat-layout">
    <aside class="chat-sidebar">
      <h3 class="sidebar-title">
        ห้องของคุณ
      </h3>
      <ul>
        <li
          v-for="room in joinedRooms"
          :key="room._id"
          :class="{ active: currentRoom && currentRoom._id === room._id }"
        >
          <nuxt-link :to="`/room/${room._id}`">
            # {{ room.name }}
          </nuxt-link>
        </li>
      </ul>
    </aside>

    <section class="chat-main">
      <header class="chat-header">
        <h2># {{ currentRoom?.name || "เลือกห้อง" }}</h2>
      </header>

      <MessageList :messages="messages" class="chat-messages" />

      <TypingIndicator v-if="isTyping" />

      <MessageInput
        ref="messageInput"
        @send="sendMessage"
        @typing="notifyTyping"
      />

      <EmojiPicker v-if="showEmoji" @select="addEmoji" />
    </section>

    <aside class="chat-members">
      <h3 class="members-title">
        สมาชิก
      </h3>
      <MemberList :members="members" />
    </aside>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
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

  async asyncData ({ store, params }) {
    await store.dispatch('chat/fetchRooms')

    const rooms = store.state.chat.rooms || []
    const room = rooms.find(r => r._id === params.roomId)

    if (room) {
      store.commit('chat/SET_CURRENT_ROOM', room)
    }
  },

  data () {
    return {
      showEmoji: false,
      isTyping: false
    }
  },

  computed: {
    currentRoom () {
      return this.$store.state.chat.currentRoom
    },
    joinedRooms () {
      return this.$store.state.chat.rooms.filter(r =>
        r.members?.some(m => m.userId === this.$store.state.auth.user._id)
      )
    },
    ...mapState('chat', ['messages', 'members', 'currentRoom'])
  },

  mounted () {
    this.$socket.emit('joinRoom', this.$route.params.roomId)

    this.$socket.on('newMessage', (msg) => {
      this.addMessage(msg)
    })

    this.$socket.on('userTyping', () => {
      this.isTyping = true
      setTimeout(() => (this.isTyping = false), 2000)
    })

    this.$socket.on('userJoined', (user) => {
      this.addMember(user)
    })

    this.$socket.on('userLeft', (userId) => {
      this.removeMember(userId)
    })
  },

  beforeDestroy () {
    this.$socket.emit('leaveRoom', this.$route.params.roomId)
  },

  methods: {
    ...mapActions('chat', ['sendMessageAction', 'addMessage', 'addMember', 'removeMember']),

    async sendMessage (content) {
      const msg = {
        roomId: this.$route.params.roomId,
        userId: this.$store.state.auth.user._id,
        content
      }
      await this.sendMessageAction(msg)
      this.$socket.emit('sendMessage', msg)
    },

    notifyTyping () {
      this.$socket.emit('typing', {
        roomId: this.$route.params.roomId,
        user: this.$store.state.auth.user.fullname
      })
    },

    addEmoji (emoji) {
      this.$refs.messageInput.insertEmoji(emoji)
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
}

.chat-sidebar {
  background: #202225;
  padding: 10px;
  border-right: 1px solid #333;
  overflow-y: auto;
}
.sidebar-title {
  font-size: 14px;
  margin-bottom: 10px;
  color: #b9bbbe;
}
.chat-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.chat-sidebar li {
  margin-bottom: 8px;
}
.chat-sidebar li.active a {
  color: #7289da;
  font-weight: bold;
}

.chat-main {
  display: flex;
  flex-direction: column;
  background: #36393f;
}
.chat-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-members {
  background: #2f3136;
  padding: 10px;
  border-left: 1px solid #333;
  overflow-y: auto;
}
.members-title {
  font-size: 14px;
  margin-bottom: 10px;
  color: #b9bbbe;
}
</style>

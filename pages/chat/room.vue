<!-- pages/chat/room.vue -->
<template>
  <div
    class="chat-room-page"
    :data-theme="chatTheme"
  >
    <div class="chat-area">
      <header class="chat-header">
        <div class="header-content">
          <div class="room-info">
            <div class="room-avatar">
              <i class="fas fa-comments" />
            </div>
            <div class="room-details">
              <h4 class="room-name">
                {{ currentRoom.name || roomId }}
              </h4>
              <p class="room-status">
                <span class="status-dot" :class="socketConnected ? 'online' : 'offline'" />
                {{ roomStatusText }}
              </p>
            </div>
          </div>
          <div class="header-actions">
            <button
              class="icon-btn"
              title="ค้นหาข้อความในห้อง"
              @click="openSearch"
            >
              <i class="fas fa-magnifying-glass" />
            </button>
            <button
              class="icon-btn"
              title="ตั้งค่าธีมแชท"
              @click="openSettings"
            >
              <i class="fas fa-palette" />
            </button>
            <button class="icon-btn members-toggle-btn" title="สมาชิก" :class="{ active: showMemberSidebar }" @click="toggleMemberSidebar">
              <i class="fas fa-users" />
            </button>
            <button
              v-if="isRoomOwner"
              class="icon-btn"
              title="เก็บข้อความห้อง"
              @click="showRetentionModal = true"
            >
              <i class="fas fa-clock-rotate-left" />
            </button>
            <button
              v-if="isAdmin"
              class="icon-btn admin-btn"
              title="จัดการห้อง (แอดมิน)"
              @click="showManageModal = true"
            >
              <i class="fas fa-screwdriver-wrench" />
            </button>
            <button class="icon-btn back-btn" title="กลับ" @click.prevent="goBack">
              <i class="fas fa-arrow-left" />
            </button>
          </div>
        </div>
      </header>

      <MessageList
        ref="chatContainer"
        class="flex-grow-1"
        :messages="messages"
        :current-user-id="currentUserId"
        :typing-users="[]"
        :loading-more="loadingMore"
        :chat-theme="chatTheme"
        :can-moderate="isStaff"
        @toggle-reaction="handleToggleReaction"
        @add-reaction="handleAddReaction"
        @reply-to="handleReplyTo"
        @edit-message="handleEditMessage"
        @delete-message="handleDeleteMessage"
        @load-more="loadMoreMessages"
      />

      <TypingIndicator :typing-users="typingNames" class="typing-slot" />

      <div class="message-input-container">
        <MessageInput
          ref="messageInput"
          :room-id="roomId"
          :reply-to="replyTo"
          :chat-theme="chatTheme"
          @send-message="sendMessage"
          @cancel-reply="cancelReply"
          @send-file="handleSendFile"
          @file-error="onFileError"
          @typing-start="handleTypingStart"
          @typing-stop="handleTypingStop"
        />
      </div>
    </div>

    <aside class="member-sidebar" :class="{ hidden: !showMemberSidebar }">
      <DiscordMemberList
        :room-id="roomId"
        :current-user-id="currentUserId"
        :chat-theme="chatTheme"
        :member-count="currentRoom.memberCount || 0"
        :owner-id="String(currentRoom.createdBy || '')"
        :can-kick="canKick"
        @close="showMemberSidebar = false"
        @kick-member="handleKickMember"
        @select-member="goToMemberDM"
        @message-member="goToMemberDM"
      />
    </aside>

    <div v-if="showMemberSidebar" class="sidebar-overlay" @click="showMemberSidebar = false" />

    <transition name="emoji-fade">
      <div v-if="showReactionPicker" class="reaction-picker-overlay" @click="showReactionPicker = false">
        <div class="reaction-picker-panel" @click.stop>
          <div class="picker-header">
            <h6>เลือกรีแอคชั่น</h6>
            <button class="close-picker" @click="showReactionPicker = false">
              <i class="fas fa-times" />
            </button>
          </div>
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
        </div>
      </div>
    </transition>

    <RoomSettings
      v-model="roomSettings"
      :show="showSettingsModal"
      :available-themes="availableThemes"
      @save="handleSettingsSave"
      @close="closeSettings"
    />

    <RetentionModal
      :show="showRetentionModal"
      :room-id="roomId"
      :retention-days="currentRoom.retentionDays"
      :retention-paid-until="currentRoom.retentionPaidUntil"
      @close="showRetentionModal = false"
      @extended="onRetentionExtended"
    />

    <RoomManagePanel
      :show="showManageModal"
      :room="currentRoom"
      :room-id="roomId"
      :categories="manageCategories"
      @close="showManageModal = false"
      @saved="onRoomUpdated"
      @deleted="onRoomDeleted"
    />

    <transition name="search-fade">
      <div v-if="showSearch" class="search-overlay" @click.self="closeSearch">
        <div class="search-panel">
          <div class="search-panel-header">
            <div class="search-input-box">
              <i class="fas fa-magnifying-glass" />
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาข้อความในห้องนี้..."
                @input="onSearchInput"
                @keydown.esc="closeSearch"
              >
              <button v-if="searchQuery" class="search-clear" @click="clearSearch">
                <i class="fas fa-times" />
              </button>
            </div>
            <button class="search-close" @click="closeSearch">
              <i class="fas fa-times" />
            </button>
          </div>

          <div class="search-results">
            <div v-if="searchLoading" class="search-state">
              <b-spinner small class="mr-2" />กำลังค้นหา...
            </div>
            <div v-else-if="searchTouched && !searchResults.length" class="search-state">
              ไม่พบข้อความที่ตรงกับ "{{ lastSearchQuery }}"
            </div>
            <div v-else-if="!searchTouched" class="search-state muted">
              พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
            </div>
            <template v-else>
              <div class="search-result-count">
                พบ {{ searchResults.length }} ข้อความ
              </div>
              <button
                v-for="r in searchResults"
                :key="r._id"
                class="search-result-item"
                @click="jumpToSearchResult(r)"
              >
                <div class="search-result-top">
                  <span class="search-result-user">{{ r.username || 'ไม่ทราบชื่อ' }}</span>
                  <span class="search-result-time">{{ formatSearchTime(r.createdAt) }}</span>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -- highlightMatch escapes HTML before wrapping matches -->
                <div class="search-result-text" v-html="highlightMatch(r.content)" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import MessageList from '~/components/MessageList.vue'
import MessageInput from '~/components/MessageInput.vue'
import DiscordMemberList from '~/components/MemberList.vue'
import TypingIndicator from '~/components/TypingIndicator.vue'
import RoomSettings from '~/components/RoomSettings.vue'
import RetentionModal from '~/components/RetentionModal.vue'
import RoomManagePanel from '~/components/RoomManagePanel.vue'

export default {
  components: {
    MessageList,
    MessageInput,
    DiscordMemberList,
    TypingIndicator,
    RoomSettings,
    RetentionModal,
    RoomManagePanel
  },
  middleware: 'middlewareAuth',
  data () {
    return {
      roomId: this.$route.params.id || this.$route.query.id,
      loadingMore: false,
      socketConnected: false,
      roomMemberList: [],
      currentRoom: {
        name: this.$route.query?.name || this.$route.params.name || '',
        category: this.$route.query?.category || '',
        description: this.$route.query?.description || '',
        memberCount: parseInt(this.$route.query?.memberCount) || 1,
        tags: this.$route.query?.tags ? JSON.parse(this.$route.query.tags) : [],
        status: this.$route.query?.status || 'online',
        type: this.$route.query?.type || 'public',
        createdBy: '',
        iconGradient: '',
        categoryName: '',
        retentionDays: null,
        retentionPaidUntil: null
      },
      showRetentionModal: false,
      showManageModal: false,
      manageCategories: [],
      messages: [],
      typingUsers: [],
      user: null,
      replyTo: null,
      showReactionPicker: false,
      selectedMessageId: null,
      emojiList: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '✅', '❌', '⭐'],
      page: 1,
      hasMore: true,

      showSearch: false,
      searchQuery: '',
      lastSearchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchTouched: false,
      searchTimer: null,
      searchSeq: 0,

      showSettingsModal: false,
      chatTheme: 'purple',
      chatBackground: '#0f0f23',
      roomSettings: { theme: 'purple', background: '#0f0f23' },
      showMemberSidebar: typeof window !== 'undefined' ? window.innerWidth > 992 : true,

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
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isStaff () {
      return this.$store.getters.isStaff
    },
    isRoomOwner () {
      return !!this.currentRoom.createdBy &&
        String(this.currentRoom.createdBy) === String(this.currentUserId)
    },
    canKick () {
      return this.isRoomOwner || this.isStaff
    },
    typingNames () {
      return this.typingUsers
        .filter(u => u.userId !== this.currentUserId)
        .map(u => u.username)
    },
    onlineCount () {
      return this.currentRoom.memberCount || 0
    },
    roomStatusText () {
      if (!this.socketConnected) { return 'กำลังเชื่อมต่อใหม่...' }
      return `${this.onlineCount} สมาชิกในห้อง`
    }
  },
  watch: {
    replyTo (val) {
      if (!val) { return }
      this.$nextTick(() => {
        const list = this.$refs.chatContainer
        if (list && list.isAtBottom !== false) {
          list.scrollToBottom()
        }
      })
    },
    'roomSettings.theme' (newVal) {
      if (newVal) {
        this.chatTheme = newVal
      }
    },
    'roomSettings.background' (newVal) {
      if (newVal) {
        this.chatBackground = newVal
      }
    },
    '$route.params.id' (newId) {
      if (newId) {
        this.roomId = newId
        this.loadRoomSettings()
      }
    }
  },
  async mounted () {
    document.documentElement.style.setProperty('font-size', '16px', 'important')

    this.loadUserData()
    this.loadRoomSettings()

    if (!this.roomId) { return }

    this.$anime({
      targets: '.chat-room-page',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutQuad'
    })

    this.$anime({
      targets: '.chat-header',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 400,
      delay: 200,
      easing: 'easeOutQuad'
    })

    this.$anime({
      targets: '.member-sidebar',
      opacity: [0, 1],
      translateX: [20, 0],
      duration: 400,
      delay: 400,
      easing: 'easeOutQuad'
    })

    await this.fetchRoomInfo()
    await this.fetchMessages()
    this.setupSocketListeners()

    if (this.$store.getters.isAdmin) {
      this.loadManageCategories()
    }
  },
  beforeDestroy () {
    document.documentElement.style.removeProperty('font-size')
    clearTimeout(this.searchTimer)
    if (this.$socket) {
      this.$socket.off('receiveMessage')
      this.$socket.off('messageReaction')
      this.$socket.off('messageDeleted')
      this.$socket.off('messageEdited')
      this.$socket.off('userTyping')
      this.$socket.off('userStoppedTyping')
      this.$socket.off('roomMembers', this.onRoomMembers)
      this.$socket.off('roomKicked', this.onRoomKicked)
      this.$socket.off('roomClosed', this.onRoomClosed)
      this.$socket.off('connect', this.onSocketConnect)
      this.$socket.off('disconnect', this.onSocketDisconnect)
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
          this.chatTheme = parsed.theme || 'purple'
          this.chatBackground = parsed.background || '#0f0f23'
          this.roomSettings = { theme: this.chatTheme, background: this.chatBackground }
        } else {
          this.chatTheme = 'purple'
          this.chatBackground = '#0f0f23'
          this.roomSettings = { theme: 'purple', background: '#0f0f23' }
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
      this._themeSnapshot = this.roomSettings.theme
      this.showSettingsModal = true
    },

    closeSettings () {
      if (this._themeSnapshot && this._themeSnapshot !== this.roomSettings.theme) {
        this.roomSettings = { ...this.roomSettings, theme: this._themeSnapshot }
      }
      this.showSettingsModal = false
    },

    handleSettingsSave () {
      this._themeSnapshot = this.roomSettings.theme
      this.saveRoomSettings()
      this.showSettingsModal = false
    },

    openSearch () {
      this.showSearch = true
      this.$nextTick(() => {
        this.$refs.searchInput && this.$refs.searchInput.focus()
      })
    },

    closeSearch () {
      this.showSearch = false
      clearTimeout(this.searchTimer)
    },

    clearSearch () {
      this.searchQuery = ''
      this.searchResults = []
      this.searchTouched = false
      this.$refs.searchInput && this.$refs.searchInput.focus()
    },

    onSearchInput () {
      clearTimeout(this.searchTimer)
      const term = this.searchQuery.trim()
      if (term.length < 2) {
        this.searchResults = []
        this.searchTouched = false
        this.searchLoading = false
        return
      }
      this.searchTimer = setTimeout(() => this.runSearch(term), 350)
    },

    async runSearch (term) {
      const seq = ++this.searchSeq
      this.searchLoading = true
      try {
        const res = await this.$axios.$get(
          process.env.API_SEARCH_MESSAGE.replace(':roomId', this.roomId),
          { params: { q: term } }
        )
        if (seq !== this.searchSeq) { return }
        const payload = res.result || {}
        this.searchResults = payload.messages || []
        this.lastSearchQuery = term
        this.searchTouched = true
      } catch (err) {
        if (seq !== this.searchSeq) { return }
        this.searchResults = []
        this.lastSearchQuery = term
        this.searchTouched = true
      } finally {
        if (seq === this.searchSeq) { this.searchLoading = false }
      }
    },

    highlightMatch (text) {
      const raw = String(text || '')
      const escaped = raw.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]))
      const term = this.lastSearchQuery.trim()
      if (!term) { return escaped }
      const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return escaped.replace(new RegExp(safeTerm, 'gi'), m => `<mark>${m}</mark>`)
    },

    formatSearchTime (dateString) {
      try {
        const d = new Date(dateString)
        if (isNaN(d.getTime())) { return '' }
        return d.toLocaleString('th-TH', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      } catch {
        return ''
      }
    },

    async jumpToSearchResult (result) {
      this.closeSearch()
      const list = this.$refs.chatContainer
      if (!list) { return }

      for (let i = 0; i < 15; i++) {
        if (this.messages.some(m => m._id === result._id)) {
          this.$nextTick(() => list.scrollToMessage(result._id))
          return
        }
        if (!this.hasMore) { break }
        await this.loadMoreMessages()
      }

      this.$bvToast.toast('ข้อความนี้อยู่เก่าเกินกว่าที่โหลดไว้', {
        variant: 'warning',
        solid: true
      })
    },

    async fetchRoomInfo () {
      if (!this.roomId) { return }
      try {
        const res = await this.$axios.$get(
          process.env.API_GET_ROOM_BY_ID.replace(':roomId', this.roomId)
        )
        if (res.status === 'success' && res.result) {
          const r = res.result
          this.currentRoom = {
            ...this.currentRoom,
            name: r.name || this.currentRoom.name,
            category: r.category || this.currentRoom.category,
            categoryName: r.categoryName || this.currentRoom.categoryName,
            description: r.description ?? this.currentRoom.description,
            memberCount: r.memberCount ?? this.currentRoom.memberCount,
            tags: r.tags || this.currentRoom.tags,
            status: r.status || this.currentRoom.status,
            type: r.type || this.currentRoom.type,
            createdBy: r.createdBy || this.currentRoom.createdBy,
            iconGradient: r.iconGradient || this.currentRoom.iconGradient,
            retentionDays: r.retentionDays ?? null,
            retentionPaidUntil: r.retentionPaidUntil ?? null
          }
        }
      } catch (err) {
      }
    },

    async fetchMessages () {
      try {
        if (!this.roomId) { return }

        const res = await this.$axios.$get(
          `${process.env.API_GET_CHATLOG_ROOM_ID}/${this.roomId}/messages`,
          { params: { page: 1, limit: 30 } }
        )
        const payload = res.result || {}
        const list = Array.isArray(payload) ? payload : (payload.messages || [])
        this.messages = list.map(msg => this.formatMessage(msg))
        this.page = 1
        this.hasMore = payload.hasMore || false
      } catch (err) {
        this.$bvToast.toast('ไม่สามารถโหลดข้อความได้', {
          variant: 'danger',
          solid: true
        })
      }
    },

    async loadMoreMessages () {
      if (!this.hasMore || this.loadingMore) { return }
      this.loadingMore = true
      const container = this.$refs.chatContainer?.$refs?.messageList
      const prevHeight = container ? container.scrollHeight : 0
      try {
        const nextPage = this.page + 1
        const res = await this.$axios.$get(
          `${process.env.API_GET_CHATLOG_ROOM_ID}/${this.roomId}/messages`,
          { params: { page: nextPage, limit: 30 } }
        )
        const payload = res.result || {}
        const older = (payload.messages || []).map(msg => this.formatMessage(msg))
        if (older.length === 0) {
          this.hasMore = false
          return
        }
        this.messages = [...older, ...this.messages]
        this.page = nextPage
        this.hasMore = payload.hasMore || false

        this.$nextTick(() => {
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevHeight
            }
            const list = this.$refs.chatContainer
            if (list) { list.newMessagesCount = 0 }
          })
        })
      } catch (err) {
      } finally {
        this.loadingMore = false
      }
    },

    onSocketConnect () {
      this.socketConnected = true
      this.$socket.emit('joinRoom', { roomId: this.roomId, user: this.user })
    },

    onSocketDisconnect () {
      this.socketConnected = false
    },

    onRoomMembers (members) {
      if (Array.isArray(members)) {
        this.roomMemberList = members
        this.$set(this.currentRoom, 'memberCount', members.length)
      }
    },

    setupSocketListeners () {
      this.socketConnected = this.$socket.connected
      this.$socket.on('connect', this.onSocketConnect)
      this.$socket.on('disconnect', this.onSocketDisconnect)
      this.$socket.on('roomMembers', this.onRoomMembers)
      this.$socket.on('roomKicked', this.onRoomKicked)
      this.$socket.on('roomClosed', this.onRoomClosed)

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
      this.$socket.on('userTyping', ({ userId, username }) => {
        if (userId === this.currentUserId) { return }
        if (!this.typingUsers.some(u => u.userId === userId)) {
          this.typingUsers.push({ userId, username })
        }
      })
      this.$socket.on('userStoppedTyping', ({ userId }) => {
        this.typingUsers = this.typingUsers.filter(u => u.userId !== userId)
      })
    },

    resolveFileUrl (url) {
      if (!url) { return null }
      if (/^https?:\/\//.test(url)) { return url }
      return (process.env.API_FILE_BASE || '') + url
    },

    formatMessage (msg) {
      return {
        _id: String(msg._id),
        content: msg.text || msg.content || '',
        username: msg.username || msg.user?.username || 'Unknown',
        fullName: msg.fullName || `${msg.user?.firstName || ''} ${msg.user?.lastName || ''}`.trim() || msg.username,
        avatar: this.resolveFileUrl(msg.avatar || msg.user?.avatar) || null,
        userId: String(msg.userId || msg.user?._id || ''),
        createdAt: msg.timestamp || msg.createdAt || new Date(),
        type: msg.type || 'text',
        replyTo: msg.replyTo || null,
        reactions: msg.reactions || [],
        status: msg.status || 'sent',
        edited: msg.edited || false,
        fileUrl: this.resolveFileUrl(msg.fileUrl),
        fileName: msg.fileName || null,
        fileSize: msg.fileSize || null,
        fileType: msg.fileType || null
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

    async handleSendFile (file) {
      const input = this.$refs.messageInput
      input && input.setUploading && input.setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await this.$axios.$post(process.env.API_UPLOAD_FILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (res.status === 'success' && res.result) {
          const f = res.result
          const payload = {
            roomId: this.roomId,
            message: f.fileName,
            user: this.user,
            type: f.type,
            file: {
              fileUrl: f.url,
              fileName: f.fileName,
              fileSize: f.fileSize,
              fileType: f.fileType
            }
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
        }
      } catch (err) {
        this.$bvToast.toast(
          err.response?.data?.message || 'อัปโหลดไฟล์ไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      } finally {
        input && input.setUploading && input.setUploading(false)
      }
    },

    onFileError (message) {
      this.$bvToast.toast(message || 'ไฟล์ไม่ถูกต้อง', { variant: 'warning', solid: true })
    },

    handleTypingStart () {
      this.$socket.emit('typing', {
        roomId: this.roomId,
        userId: this.currentUserId,
        username: this.user?.username || this.user?.fullname || 'Unknown'
      })
    },

    handleTypingStop () {
      this.$socket.emit('stopTyping', {
        roomId: this.roomId,
        userId: this.currentUserId
      })
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
        this.$refs.messageInput && this.$refs.messageInput.focusInput()
      })
    },

    cancelReply () {
      this.replyTo = null
    },

    async handleEditMessage (message) {
      if (!message || message.type !== 'text') { return }
      const { value, isConfirmed } = await this.$swal({
        title: 'แก้ไขข้อความ',
        input: 'textarea',
        inputValue: message.content,
        inputAttributes: { 'aria-label': 'แก้ไขข้อความ' },
        showCancelButton: true,
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#7c6ff5',
        inputValidator (v) {
          if (!v || !v.trim()) { return 'กรุณากรอกข้อความ' }
          return undefined
        }
      })
      if (isConfirmed && value.trim() && value.trim() !== message.content) {
        this.$socket.emit('editMessage', {
          roomId: this.roomId,
          messageId: message._id,
          content: value.trim(),
          userId: this.currentUserId
        })
      }
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
    },

    toggleMemberSidebar () {
      this.showMemberSidebar = !this.showMemberSidebar
    },

    goToMemberDM (member) {
      const id = member && (member._id || member.id || member.userId)
      if (!id || String(id) === String(this.currentUserId)) { return }
      this.$router.push({ path: '/chat/chat', query: { dm: String(id) } })
    },

    async handleKickMember (member) {
      const id = member && (member._id || member.id || member.userId)
      if (!id) { return }
      const name = member.username || member.fullname || member.displayName || 'สมาชิกคนนี้'
      const confirmed = await this.$bvModal.msgBoxConfirm(`เตะ ${name} ออกจากห้องนี้?`, {
        title: 'ยืนยันการเตะสมาชิก',
        okVariant: 'danger',
        okTitle: 'เตะออก',
        cancelTitle: 'ยกเลิก',
        centered: true
      })
      if (!confirmed) { return }
      try {
        await this.$axios.$post(
          process.env.API_ROOM_KICK.replace(':id', this.roomId),
          { userId: String(id) }
        )
        this.$bvToast.toast(`เตะ ${name} ออกจากห้องแล้ว`, { variant: 'success', solid: true })
      } catch (err) {
        this.$bvToast.toast(
          err.response?.data?.message || 'เตะสมาชิกไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      }
    },

    onRoomKicked ({ roomId }) {
      if (String(roomId) !== String(this.roomId)) { return }
      this.$swal({
        icon: 'warning',
        title: 'คุณถูกเตะออกจากห้อง',
        text: 'เจ้าของห้องหรือผู้ดูแลได้นำคุณออกจากห้องนี้',
        confirmButtonText: 'ตกลง'
      })
      this.$router.push('/chat/chat')
    },

    onRoomClosed ({ roomId }) {
      if (String(roomId) !== String(this.roomId)) { return }
      this.$swal({
        icon: 'info',
        title: 'ห้องนี้ถูกปิดแล้ว',
        text: 'ผู้ดูแลได้ลบห้องแชทนี้',
        confirmButtonText: 'ตกลง'
      })
      this.$router.push('/chat/chat')
    },

    onRetentionExtended (result) {
      if (result) {
        this.$set(this.currentRoom, 'retentionDays', result.retentionDays)
        this.$set(this.currentRoom, 'retentionPaidUntil', result.retentionPaidUntil)
      }
      this.showRetentionModal = false
    },

    async loadManageCategories () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_CATEGORIES_ROOM)
        if (res.status === 'success') {
          this.manageCategories = (res.result || []).filter(c => c.key !== 'all')
        }
      } catch (err) {}
    },

    onRoomUpdated (room) {
      this.currentRoom = { ...this.currentRoom, ...room }
      this.showManageModal = false
      this.$bvToast.toast('บันทึกการแก้ไขห้องแล้ว', { variant: 'success', solid: true })
    },

    onRoomDeleted () {
      this.showManageModal = false
      this.$bvToast.toast('ลบห้องแล้ว', { variant: 'success', solid: true })
      this.$router.push('/chat/chat')
    }
  }
}
</script>

<style scoped>
.icon-btn.admin-btn { background: var(--yellow); }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

.chat-room-page {
  --ink: #101014;
  --paper: #14141c;
  --paper-soft: #1b1b25;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --violet-deep: #5b4fd6;
  --yellow: #ffc94d;
  --mint: #33d9b2;
  --white: #ffffff;
  --line: 3px;
  --line-sm: 2px;
  --shadow: 6px 6px 0 var(--ink);
  --shadow-sm: 4px 4px 0 var(--ink);
  --shadow-xs: 2px 2px 0 var(--ink);
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-pill: 999px;
  --font-display: 'Space Grotesk', 'Noto Sans Thai', sans-serif;
  --font-body: 'Inter', 'Noto Sans Thai', sans-serif;

  font-family: var(--font-body);
  display: flex;
  flex-direction: row;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: var(--paper);
  position: relative;
}

.chat-room-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px);
  background-size: 22px 22px;
  pointer-events: none;
  z-index: 0;
}

.chat-area,
.member-sidebar,
.sidebar-overlay { position: relative; z-index: 1; }

.chat-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.chat-header {
  background: var(--violet);
  border-bottom: var(--line) solid var(--ink);
  padding: 18px 24px;
  flex-shrink: 0;
}

.chat-room-page[data-theme="pink"] .chat-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.chat-room-page[data-theme="purple"] .chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-room-page[data-theme="green"] .chat-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.chat-room-page[data-theme="orange"] .chat-header {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.chat-room-page[data-theme="dark"] .chat-header {
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
}

.chat-room-page[data-theme="minimal"] .chat-header {
  background: #22222c;
}

.chat-room-page[data-theme="default"] .chat-header {
  background: #0084ff;
}

.chat-room-page[data-theme="orange"] .room-name {
  color: var(--ink);
}

.chat-room-page[data-theme="orange"] .room-status {
  color: rgba(16, 16, 20, 0.62);
}

.chat-room-page[data-theme="orange"] .status-dot {
  background: rgba(16, 16, 20, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.room-avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--coral);
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--white);
  flex-shrink: 0;
}

.room-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.room-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-status {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 1.5px solid var(--ink);
}

.status-dot.online {
  background: var(--mint);
  animation: pulse-status 2s infinite;
}

.status-dot.offline {
  background: var(--coral);
  animation: pulse-status 1s infinite;
}

@keyframes pulse-status {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.2); }
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.icon-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  border: var(--line-sm) solid var(--ink);
  background: var(--white);
  color: var(--ink);
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.icon-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--ink);
}

.icon-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.icon-btn.back-btn {
  background: var(--yellow);
}

.icon-btn.members-toggle-btn.active {
  background: var(--violet);
  color: var(--white);
  border-color: var(--violet);
}

.member-sidebar {
  width: 320px;
  border-left: var(--line) solid var(--ink);
  background: #121218;
  overflow: hidden;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: relative;
  z-index: 10;
}

.member-sidebar.hidden {
  display: none;
}

@media (max-width: 992px) {
  .chat-room-page {
    height: 100vh;
    max-height: 100vh;
    flex-direction: column;
  }
  .chat-area {
    height: 100%;
    max-height: calc(100vh - 140px);
    width: 100%;
  }
  .member-sidebar {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: var(--line) solid var(--ink);
    height: min(70vh, 560px);
    max-height: 70vh;
    flex-shrink: 0;
    transform: translateY(0);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-radius: 18px 18px 0 0;
  }
  .member-sidebar.hidden {
    display: none;
  }
  .members-toggle-btn {
    display: flex;
  }
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .room-avatar { width: 44px; height: 44px; font-size: 18px; }
  .room-name { font-size: 1.05rem; }
  .reaction-picker-panel { min-width: 340px; }
  .reaction-picker-grid { grid-template-columns: repeat(5, 1fr); }
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: var(--line-sm) solid var(--ink);
  background: var(--yellow);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h5 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-count {
  background: var(--ink);
  border: var(--line-sm) solid var(--ink);
  color: var(--white);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-xs);
}

.typing-slot {
  padding: 0 16px 4px;
}

.message-input-container {
  flex-shrink: 0;
  border-top: var(--line) solid var(--ink);
  background: var(--paper-soft);
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 16, 20, 0.6);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 8vh 16px 16px;
}

.search-fade-enter-active,
.search-fade-leave-active { transition: opacity 0.16s ease; }

.search-fade-enter,
.search-fade-leave-to { opacity: 0; }

.search-panel {
  width: 100%;
  max-width: 520px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--paper-soft);
  border: var(--line) solid var(--ink);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.search-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: var(--line-sm) solid var(--ink);
  background: var(--violet);
}

.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  color: rgba(16, 16, 20, 0.5);
}

.search-input-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.92rem;
  color: var(--ink);
}

.search-clear,
.search-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(16, 16, 20, 0.5);
  font-size: 0.9rem;
}

.search-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  color: var(--ink);
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
}

.search-results {
  overflow-y: auto;
  padding: 10px;
}

.search-state {
  padding: 24px 16px;
  text-align: center;
  color: var(--cream);
  font-size: 0.88rem;
}

.search-state.muted { color: rgba(246, 243, 237, 0.5); }

.search-result-count {
  padding: 6px 10px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(246, 243, 237, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.search-result-item {
  width: 100%;
  text-align: left;
  background: var(--paper);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.search-result-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-xs);
}

.search-result-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.search-result-user {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--violet);
}

.search-result-time {
  font-size: 0.72rem;
  color: rgba(246, 243, 237, 0.45);
  flex-shrink: 0;
}

.search-result-text {
  font-size: 0.86rem;
  color: var(--cream);
  line-height: 1.4;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result-text ::v-deep mark {
  background: var(--yellow);
  color: var(--ink);
  border-radius: 3px;
  padding: 0 2px;
}

@media (max-width: 480px) {
  .search-overlay { padding: 6vh 10px 10px; }
  .search-panel { max-height: 78vh; }
}

.reaction-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(16, 16, 20, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.reaction-picker-panel {
  background: var(--cream);
  border: var(--line) solid var(--ink);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 20px;
  min-width: 360px;
  animation: slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: var(--line-sm) dashed var(--ink);
}

.picker-header h6 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
}

.close-picker {
  background: var(--coral);
  border: var(--line-sm) solid var(--ink);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--white);
  box-shadow: var(--shadow-xs);
  transition: transform 0.12s ease;
}

.close-picker:hover { transform: rotate(90deg); }

.reaction-picker-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-btn {
  font-size: 1.6rem;
  padding: 10px;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xs);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

.emoji-btn:hover {
  background: var(--yellow);
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--ink);
}

.emoji-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}

.emoji-fade-enter-active,
.emoji-fade-leave-active { transition: all 0.2s ease; }

.emoji-fade-enter-from,
.emoji-fade-leave-to { opacity: 0; transform: scale(0.94); }

.message-bubble {
  background: var(--white) !important;
  border: var(--line-sm) solid var(--ink) !important;
  color: var(--ink) !important;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.message-bubble.own-message {
  background: var(--violet) !important;
  border-color: var(--ink) !important;
  color: var(--white) !important;
}

.message-bubble.other { background: var(--white) !important; }

.chat-room-page[data-theme="pink"] .message-bubble.own-message {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.chat-room-page[data-theme="purple"] .message-bubble.own-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.chat-room-page[data-theme="green"] .message-bubble.own-message {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
}

.chat-room-page[data-theme="orange"] .message-bubble.own-message {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
}

.chat-room-page[data-theme="dark"] .message-bubble.own-message {
  background: linear-gradient(135deg, #434343 0%, #000000 100%) !important;
}

.chat-room-page[data-theme="minimal"] .message-bubble.own-message {
  background: #ffffff !important;
  color: #1a1a1a !important;
}

.chat-room-page[data-theme="default"] .message-bubble.own-message {
  background: #0084ff !important;
}

.member-item {
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-md);
  color: var(--ink);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.member-item:hover {
  border-color: var(--ink);
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}

.member-name { color: var(--ink); font-weight: 600; }
.member-status { color: var(--violet-deep); }

.member-search-input {
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  color: var(--ink);
  border-radius: var(--radius-md);
}

.member-search-input::placeholder { color: rgba(16, 16, 20, 0.45); }

.member-search-input:focus {
  background: var(--white);
  border-color: var(--violet);
  outline: none;
}

.date-separator {
  background: var(--yellow);
  color: var(--ink);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-pill);
  font-weight: 700;
}

.modal-content {
  background: var(--paper-soft);
  border: var(--line) solid var(--ink);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.modal-header {
  border-bottom: var(--line-sm) solid var(--ink);
  background: var(--coral);
  border-radius: calc(var(--radius-lg) - 3px) calc(var(--radius-lg) - 3px) 0 0;
}

.modal-body { padding: 24px; }

@media (max-width: 992px) {
  .chat-room-page {
    height: 100vh;
    max-height: 100vh;
    flex-direction: column;
  }
  .chat-area {
    height: 100%;
    max-height: 100vh;
    width: 100%;
  }
  .member-sidebar {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: var(--line) solid var(--ink);
    height: min(72vh, 560px);
    max-height: 72vh;
    flex-shrink: 0;
    transform: translateY(0);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-radius: 18px 18px 0 0;
  }
  .member-sidebar.hidden {
    display: none;
  }
  .members-toggle-btn {
    display: flex;
  }
  .room-avatar { width: 44px; height: 44px; font-size: 18px; }
  .room-name { font-size: 1.05rem; }
  .reaction-picker-panel { min-width: 340px; }
  .reaction-picker-grid { grid-template-columns: repeat(5, 1fr); }
}

@media (max-width: 768px) {
  .chat-room-page { flex-direction: column; }
  .chat-area {
    width: 100%;
    max-width: 100%;
    height: 100vh;
  }
  .member-sidebar {
    width: 100%;
    max-width: 100%;
    height: min(72vh, 560px);
    max-height: 72vh;
    border-left: none;
    border-top: var(--line) solid var(--ink);
  }
  .chat-header { padding: 14px 16px; }
  .header-content { gap: 12px; }
  .room-info { gap: 10px; }
  .room-avatar { width: 40px; height: 40px; font-size: 16px; }
  .room-name { font-size: 0.98rem; max-width: calc(100vw - 160px); }
  .room-status { font-size: 0.76rem; }
  .icon-btn { width: 38px; height: 38px; font-size: 0.85rem; }
  .sidebar-header { padding: 12px 16px; }
  .reaction-picker-panel { min-width: 90%; max-width: 400px; padding: 18px; }
  .reaction-picker-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .emoji-btn { font-size: 1.5rem; padding: 9px; }
  .typing-slot { padding: 0 12px 4px; }
  .message-input-container { padding: 0; }
}

@media (max-width: 640px) {
  .chat-room-page { flex-direction: column; }
  .chat-area {
    width: 100%;
    max-width: 100%;
    height: 100vh;
  }
  .member-sidebar {
    width: 100%;
    max-width: 100%;
    height: min(72vh, 560px);
    max-height: 72vh;
    border-left: none;
    border-top: var(--line) solid var(--ink);
  }
  .chat-header { padding: 10px 14px; }
  .header-content { gap: 10px; }
  .room-info { gap: 8px; }
  .room-avatar { width: 36px; height: 36px; font-size: 14px; }
  .room-name { font-size: 0.9rem; max-width: calc(100vw - 140px); }
  .room-status { font-size: 0.7rem; gap: 6px; }
  .status-dot { width: 7px; height: 7px; }
  .icon-btn { width: 34px; height: 34px; font-size: 0.8rem; }
  .header-actions { gap: 8px; }
  .sidebar-header { padding: 10px 14px; }
  .sidebar-header h5 { font-size: 0.85rem; gap: 8px; }
  .member-count { font-size: 0.7rem; padding: 3px 10px; }
  .reaction-picker-panel { min-width: 92%; padding: 16px; }
  .reaction-picker-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .emoji-btn { font-size: 1.3rem; padding: 7px; }
  .picker-header h6 { font-size: 0.9rem; }
  .close-picker { width: 28px; height: 28px; font-size: 0.9rem; }
}

@media (max-width: 480px) {
  .chat-room-page {
    --line: 2px;
    --line-sm: 1.5px;
    flex-direction: column;
  }
  .chat-area {
    width: 100%;
    max-width: 100%;
    height: 100vh;
  }
  .member-sidebar {
    width: 100%;
    max-width: 100%;
    height: min(78vh, 520px);
    max-height: 78vh;
    border-left: none;
    border-top: var(--line) solid var(--ink);
  }
  .chat-header { padding: 8px 12px; }
  .header-content { gap: 8px; }
  .room-info { gap: 8px; }
  .room-avatar { width: 32px; height: 32px; font-size: 13px; border-radius: 12px; }
  .room-name { font-size: 0.85rem; max-width: calc(100vw - 120px); }
  .room-status { font-size: 0.68rem; }
  .icon-btn { width: 32px; height: 32px; font-size: 0.75rem; border-radius: 50%; }
  .header-actions { gap: 6px; }
  .sidebar-header { padding: 8px 12px; }
  .sidebar-header h5 { font-size: 0.8rem; }
  .member-count { font-size: 0.65rem; padding: 2px 8px; }
  .reaction-picker-panel { min-width: 95%; padding: 14px; border-radius: 18px; }
  .reaction-picker-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .emoji-btn { font-size: 1.2rem; padding: 6px; border-radius: 12px; }
  .typing-slot { padding: 0 10px 4px; }
  .picker-header { margin-bottom: 12px; padding-bottom: 10px; }
  .picker-header h6 { font-size: 0.85rem; }
  .close-picker { width: 26px; height: 26px; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .chat-room-page { flex-direction: column; }
  .member-sidebar {
    height: 88vh;
    max-height: 88vh;
    border-left: none;
    border-top: var(--line) solid var(--ink);
  }
  .chat-header { padding: 8px 12px; }
  .room-avatar { width: 32px; height: 32px; }
  .room-name { font-size: 0.85rem; }
  .room-status { font-size: 0.65rem; }
  .icon-btn { width: 32px; height: 32px; }
  .reaction-picker-panel { min-width: 90%; max-height: 60vh; overflow-y: auto; }
  .reaction-picker-grid { grid-template-columns: repeat(6, 1fr); gap: 6px; }
}

@media (max-width: 360px) {
  .chat-header { padding: 6px 10px; }
  .room-avatar { width: 28px; height: 28px; font-size: 12px; }
  .room-name { font-size: 0.78rem; max-width: calc(100vw - 120px); }
  .room-status { font-size: 0.62rem; gap: 5px; }
  .status-dot { width: 6px; height: 6px; }
  .icon-btn { width: 28px; height: 28px; font-size: 0.7rem; }
  .header-actions { gap: 5px; }
  .member-sidebar { height: 82vh; max-height: 82vh; }
  .sidebar-header h5 { font-size: 0.75rem; }
  .member-count { font-size: 0.6rem; padding: 2px 6px; }
  .reaction-picker-panel { min-width: 98%; padding: 12px; }
  .reaction-picker-grid { grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .emoji-btn { font-size: 1.1rem; padding: 5px; }
}
</style>

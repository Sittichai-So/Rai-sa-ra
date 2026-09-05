const API_BASE = process.env.API_BASE || 'http://localhost:8012/api/raisara'
const FILE_BASE = process.env.API_FILE_BASE || 'http://localhost:8012'

const environment = {
  development: { api: API_BASE },
  production: { api: API_BASE },
  test: { api: API_BASE }
}

// Fallback so a missing/unknown NODE_ENV never crashes config loading.
const currentEnv = environment[process.env.NODE_ENV] || environment.development

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'rai-sa-ra',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/3.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/fonts.css',
    '@/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.css',
    '@fortawesome/fontawesome-free/css/all.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/socket.client.js', mode: 'client' },
    { src: '~/plugins/vee-validate.js' },
    { src: '~/plugins/loading.js' },
    { src: '~/plugins/initAuth.js', mode: 'client' },
    { src: '~/plugins/anime.js', mode: 'client' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'vue-sweetalert2/nuxt'
  ],

  env: {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE: currentEnv.api,
    API_FILE_BASE: FILE_BASE,

    // auth
    API_LOGIN: currentEnv.api + '/auth/login',
    API_REGISTER_USER: currentEnv.api + '/auth/register',
    API_CHECK_USERNAME: currentEnv.api + '/auth/check-username',
    API_FORGOT_PASSWORD: currentEnv.api + '/auth/forgot-password',
    API_RESET_PASSWORD: currentEnv.api + '/auth/reset-password',
    API_VERIFY_EMAIL: currentEnv.api + '/auth/verify-email',
    API_RESEND_VERIFICATION: currentEnv.api + '/auth/resend-verification',

    // getCategories
    API_GET_CATEGORIES_ROOM: currentEnv.api + '/categories/getCategories',

    // room
    API_GET_ROOM: currentEnv.api + '/room/getRoom',
    API_JOIN_ROOM_USERS: currentEnv.api + '/room/joinRoom',
    API_CREATE_ROOM: currentEnv.api + '/room/createRoom',
    API_LEAVE_ROOM_USERS: currentEnv.api + '/room/removeJoinRoom',

    // chat
    API_GET_ROOM_MEMBER: currentEnv.api + '/chat/:roomId/members',
    API_GET_ROOM_BY_ID: currentEnv.api + '/chat/room/:roomId',

    // chatLog (ข้อความในห้อง)
    API_GET_CHATLOG_ROOM_ID: currentEnv.api + '/chatLog',
    API_DELETE_CHATLOG_ROOM_ID: currentEnv.api + '/chatLog',
    API_SEARCH_MESSAGE: currentEnv.api + '/chatLog/:roomId/search',

    // count
    API_GET_COUNT_ALL_CHAT_MESSAGES: currentEnv.api + '/chatLog/counts/all',

    // upload
    API_UPLOAD_FILE: currentEnv.api + '/upload',

    // direct messages
    API_DM_CONVERSATIONS: currentEnv.api + '/dm/conversations',
    API_DM_MESSAGES: currentEnv.api + '/dm/:friendId/messages',
    API_DM_READ: currentEnv.api + '/dm/:friendId/read',

    // friends
    API_SEND_FRIEND: currentEnv.api + '/friends/send',
    API_POST_ACCEPT_FRIENDSHIP_ID: currentEnv.api + '/friends/accept/:friendshipId',
    API_POST_REJECT_FRIENDSHIP_ID: currentEnv.api + '/friends/reject/:friendshipId',
    API_DELETE_CANCEL_FRIENDSHIP_ID: currentEnv.api + '/friends/cancel/:friendshipId',
    API_DELETE_REMOVE_FRIENDSHIP_ID: currentEnv.api + '/friends/:friendId',
    API_GET_ALL_FRIENDSHIP_ID: currentEnv.api + '/friends/all',
    API_ONLINE_FRIEND: currentEnv.api + '/friends/online',
    API_PENDING_FRIEND: currentEnv.api + '/friends/pending',
    API_SENT_FRIEND: currentEnv.api + '/friends/sent',
    API_SEARCH_FRIEND: currentEnv.api + '/friends/search',
    API_STATS_FRIEND: currentEnv.api + '/friends/stats',
    API_PROFILE_FRIEND_ID: currentEnv.api + '/friends/profile/:friendId',

    // users
    API_PATCH_USER_STATUS: currentEnv.api + '/user/:id/status',
    API_GET_USER_BY_ID: currentEnv.api + '/user/getByID',
    API_EDIT_PROFILE_BY_ID: currentEnv.api + '/user/editProfile',
    API_EDIT_PASSWORD_BY_ID: currentEnv.api + '/user/resetPassword',

    // landing stats
    API_STATS: currentEnv.api + '/stats',

    // socket
    SOCKET_URL: process.env.SOCKET_URL || FILE_BASE
  },

  bootstrapVue: {
    icons: true
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      'vee-validate/dist/rules',
      'date-fns'
    ]
  }
}

const UAT_HOST = 'https://back-raisara.onrender.com'

const environments = {
  local: {
    api: process.env.API_BASE || 'http://localhost:8012/api/raisara',
    file: process.env.API_FILE_BASE || 'http://localhost:8012'
  },
  uat: {
    api: process.env.API_BASE || UAT_HOST + '/api/raisara',
    file: process.env.API_FILE_BASE || UAT_HOST
  }
}

const APP_ENV = process.env.APP_ENV === 'uat' ? 'uat' : 'local'
const currentEnv = environments[APP_ENV]
const FILE_BASE = currentEnv.file

export default {
  ssr: false,

  target: 'static',

  head: {
    title: 'rai-sa-ra',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/3.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
    ]
  },

  css: [
    '@/assets/css/fonts.css',
    '@/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.css',
    '@fortawesome/fontawesome-free/css/all.css'
  ],

  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/socket.client.js', mode: 'client' },
    { src: '~/plugins/vee-validate.js' },
    { src: '~/plugins/loading.js' },
    { src: '~/plugins/initAuth.js', mode: 'client' },
    { src: '~/plugins/anime.js', mode: 'client' }
  ],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module'
  ],

  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    'vue-sweetalert2/nuxt'
  ],

  env: {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV,
    API_BASE: currentEnv.api,
    API_FILE_BASE: FILE_BASE,

    API_LOGIN: currentEnv.api + '/auth/login',
    API_REGISTER_USER: currentEnv.api + '/auth/register',
    API_CHECK_USERNAME: currentEnv.api + '/auth/check-username',
    API_FORGOT_PASSWORD: currentEnv.api + '/auth/forgot-password',
    API_RESET_PASSWORD: currentEnv.api + '/auth/reset-password',
    API_VERIFY_EMAIL: currentEnv.api + '/auth/verify-email',
    API_RESEND_VERIFICATION: currentEnv.api + '/auth/resend-verification',

    API_GET_CATEGORIES_ROOM: currentEnv.api + '/categories/getCategories',

    API_GET_ROOM: currentEnv.api + '/room/getRoom',
    API_JOIN_ROOM_USERS: currentEnv.api + '/room/joinRoom',
    API_CREATE_ROOM: currentEnv.api + '/room/createRoom',
    API_LEAVE_ROOM_USERS: currentEnv.api + '/room/removeJoinRoom',
    API_ROOM_UPDATE: currentEnv.api + '/room/:id',
    API_ROOM_DELETE: currentEnv.api + '/room/:id',
    API_ROOM_PASSWORD: currentEnv.api + '/room/:id/password',
    API_ROOM_KICK: currentEnv.api + '/room/:id/kick',

    API_GET_ROOM_MEMBER: currentEnv.api + '/chat/:roomId/members',
    API_GET_ROOM_BY_ID: currentEnv.api + '/chat/room/:roomId',

    API_GET_CHATLOG_ROOM_ID: currentEnv.api + '/chatLog',
    API_DELETE_CHATLOG_ROOM_ID: currentEnv.api + '/chatLog',
    API_SEARCH_MESSAGE: currentEnv.api + '/chatLog/:roomId/search',

    API_GET_COUNT_ALL_CHAT_MESSAGES: currentEnv.api + '/chatLog/counts/all',

    API_UPLOAD_FILE: currentEnv.api + '/upload',

    API_DM_CONVERSATIONS: currentEnv.api + '/dm/conversations',
    API_DM_MESSAGES: currentEnv.api + '/dm/:friendId/messages',
    API_DM_MESSAGE: currentEnv.api + '/dm/messages/:messageId',
    API_DM_READ: currentEnv.api + '/dm/:friendId/read',

    API_SUPPORT_CONTACT: currentEnv.api + '/support/contact',
    API_SUPPORT_THREADS: currentEnv.api + '/support/threads',

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
    API_FRIENDS_BLOCK: currentEnv.api + '/friends/block/:userId',
    API_FRIENDS_BLOCKED: currentEnv.api + '/friends/blocked',

    API_PATCH_USER_STATUS: currentEnv.api + '/user/:id/status',
    API_GET_USER_BY_ID: currentEnv.api + '/user/getByID',
    API_EDIT_PROFILE_BY_ID: currentEnv.api + '/user/editProfile',
    API_EDIT_PASSWORD_BY_ID: currentEnv.api + '/user/resetPassword',
    API_USER_AVATAR: currentEnv.api + '/user/avatar',

    API_ADMIN_USERS: currentEnv.api + '/user/admin/list',
    API_ADMIN_USER_ROLE: currentEnv.api + '/user/admin/:id/role',
    API_ADMIN_USER_ACTIVE: currentEnv.api + '/user/admin/:id/active',

    API_STATS: currentEnv.api + '/stats',

    API_GAME_LEADERBOARD: currentEnv.api + '/game/leaderboard',
    API_GAME_MY_STATS: currentEnv.api + '/game/my-stats',

    API_COINS_WALLET: currentEnv.api + '/coins/wallet',
    API_COINS_PACKAGES: currentEnv.api + '/coins/packages',
    API_COINS_TOPUP: currentEnv.api + '/coins/topup',
    API_COINS_TOPUP_SLIP: currentEnv.api + '/coins/topup/:id/slip',
    API_COINS_TOPUP_STATUS: currentEnv.api + '/coins/topup/:id',
    API_COINS_ADMIN_TOPUPS: currentEnv.api + '/coins/admin/topups',
    API_COINS_ADMIN_APPROVE: currentEnv.api + '/coins/admin/topups/:id/approve',
    API_COINS_ADMIN_REJECT: currentEnv.api + '/coins/admin/topups/:id/reject',
    API_COINS_ADMIN_REFUND: currentEnv.api + '/coins/admin/topups/:id/refund',
    API_ROOM_EXTEND_RETENTION: currentEnv.api + '/room/:id/extend-retention',

    SOCKET_URL: process.env.SOCKET_URL || FILE_BASE
  },

  bootstrapVue: {
    icons: true
  },

  axios: {
    baseURL: '/'
  },

  build: {
    transpile: [
      'vee-validate/dist/rules',
      'date-fns'
    ]
  }
}

const environment = {
  development: {
    api: 'http://localhost:8012/api/raisara'
  },
  production: {
    // uat
    // api: 'https://uat-config-ktb.thaijobjob.com/api/config'
  }
}

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
      { rel: 'icon', type: 'image/x-icon', href: '/3.png' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/fonts.css',
    '@mdi/font/css/materialdesignicons.css',
    '@fortawesome/fontawesome-free/css/all.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/socket.client.js', mode: 'client' },
    { src: '~/plugins/vee-validate.js' },
    { src: '~/plugins/loading.js' },
    { src: '~/plugins/initAuth.js', mode: 'client' }
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
    // auth
    API_LOGIN: environment[process.env.NODE_ENV].api + '/auth/login',
    API_REGISTER_USER: environment[process.env.NODE_ENV].api + '/auth/register',
    API_CHECK_USERNAME: environment[process.env.NODE_ENV].api + '/auth/check-username',

    // getCategories
    API_GET_CATEGORIES_ROOM: environment[process.env.NODE_ENV].api + '/categories/getCategories',

    // room
    API_GET_ROOM: environment[process.env.NODE_ENV].api + '/room/getRoom',
    API_JOIN_ROOM_USERS: environment[process.env.NODE_ENV].api + '/room/joinRoom',

    // chat
    API_GET_ROOMID_MESSAGE: environment[process.env.NODE_ENV].api + '/chat/:roomId/messages',
    API_SENT_MESSAGE: environment[process.env.NODE_ENV].api + '/chat/:roomId/messages',
    API_UPDATE_MESSAGE: environment[process.env.NODE_ENV].api + '/chat/messages/:messageId',
    API_DELETE_MESSAGE: environment[process.env.NODE_ENV].api + '/chat/messages/:messageId',
    API_SEARCH_MESSAGE: environment[process.env.NODE_ENV].api + '/chat/:roomId/search',
    API_GET_ROOM_MEMBER: environment[process.env.NODE_ENV].api + '/chat/:roomId/members',

    // chatLog
    API_GET_CHATLOG_ROOM_ID: environment[process.env.NODE_ENV].api + '/chatLog',
    API_DELETE_CHATLOG_ROOM_ID: environment[process.env.NODE_ENV].api + '/chatLog',

    // count
    API_GET_COUNT_ALL_CHAT_MESSAGES: environment[process.env.NODE_ENV].api + '/chatLog/counts/all',

    // friends
    API_SEND_FRIEND: environment[process.env.NODE_ENV].api + '/friends/send',
    API_POST_ACCEPT_FRIENDSHIP_ID: environment[process.env.NODE_ENV].api + '/friends/accept/:friendshipId',
    API_POST_REJECT_FRIENDSHIP_ID: environment[process.env.NODE_ENV].api + '/friends/reject/:friendshipId',
    API_DELETE_CANCEL_FRIENDSHIP_ID: environment[process.env.NODE_ENV].api + '/friends/cancel/:friendshipId',
    API_DELETE_REMOVE_FRIENDSHIP_ID: environment[process.env.NODE_ENV].api + '/friends/:friendId',
    API_GET_ALL_FRIENDSHIP_ID: environment[process.env.NODE_ENV].api + '/friends/all',
    API_ONLINE_FRIEND: environment[process.env.NODE_ENV].api + '/friends/online',
    API_PENDING_FRIEND: environment[process.env.NODE_ENV].api + '/friends/pending',
    API_SENT_FRIEND: environment[process.env.NODE_ENV].api + '/friends/sent',
    API_SEARCH_FRIEND: environment[process.env.NODE_ENV].api + '/friends/search',
    API_STATS_FRIEND: environment[process.env.NODE_ENV].api + '/friends/stats',
    API_PROFILE_FRIEND_ID: environment[process.env.NODE_ENV].api + '/friends/profile/:friendId',

    // users
    API_PATCH_USER_STATUS: environment[process.env.NODE_ENV].api + '/users/:roomId/members',

    // socket
    SOCKET_URL: process.env.SOCKET_URL
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

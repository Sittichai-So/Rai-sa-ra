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
      { rel: 'icon', type: 'image/x-icon', href: '/rai.png' }
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
    { src: '~/plugins/socket.client.js', mode: 'client' },
    { src: '~/plugins/vee-validate.js' }
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

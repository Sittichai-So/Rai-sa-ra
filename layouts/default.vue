<template>
  <div>
    <Nuxt />
  </div>
</template>

<script>

export default {
  data () {
    return {
      isLogin: false
    }
  },
  methods: {
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
    }
  }
}
</script>

<style>

html {
  font-size: 22px !important;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body{
  padding: 0;
  position: relative;
  font-family: 'thai_sans_literegular';
  background-color: #f5f8fa;
  font-size: 22px !important;
  min-height:100vh;
}

.center{
  text-align: center;
}
.left{
  text-align: left;
}
.right{
  text-align: right;
}

.invalid-feedback{
  font-size: 20px;
}

.custom-select {
  font-size: 1.2rem;
}

.form-control {
  font-size: 22px;
}

.container {
  max-width: 85%;
}

.zoom {
  position: relative;
  transition: transform .2s;
  margin: 0 auto;
  z-index:150;
}

.zoom:hover {
  transform: scale(3);
  z-index:150;
}

.ql-align-center {
  text-align: center;
}

.ql-align-right {
  text-align: right;
}

/* //////////////////////////////////// */

@media screen and (max-width: 600px) {
  #Col-MainContant {
    padding-top: 20px;
  }
}

</style>

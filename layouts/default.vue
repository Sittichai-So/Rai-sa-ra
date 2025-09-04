<template>
  <div>
    <headers />
    <Nuxt />
  </div>
</template>

<script>

export default {
  data () {
    return {
      isLogin: false
    }
  }
  // },
  // async mounted () {
  //   try {
  //     const token = localStorage.getItem('token')
  //     if (!token) {
  //       await this.$swal({
  //         icon: 'info',
  //         title: 'ขออภัย',
  //         text: 'กรุณาเข้าสู่ระบบ'
  //       })
  //       return this.$router.push('/')
  //     }
  //     this.$axios.setToken(token, 'Bearer')
  //     const res = await this.$axios.$get(process.env.API_AUTH_PROFILE)
  //     this.$store.commit('setUser', res.result)
  //     this.isLogin = true
  //   } catch (error) {
  //     await this.$swal('เกิดข้อผิดพลาด', 'กรุณาติดต่อเจ้าหน้าที่', 'error')
  //   }
  // }
}
</script>

<style>

html {
  /* font-size: 20px; */
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body{
  /*margin-bottom: 0;*/
  padding: 0;
  position: relative;
  font-family: 'thai_sans_literegular';
  background-color: #f5f8fa;
  font-size: 20px;
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
  font-size: 1.2rem;
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

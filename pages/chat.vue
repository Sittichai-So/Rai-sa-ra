<template>
  <b-container>
    <div>chat realtime</div>
    <div>
      <b-button block variant="light" size="lg" class="submit-btn mt-3" @click="logout">
        ออกจากระบบ
      </b-button>
    </div>
  </b-container>
</template>

<script>
export default {
  name: 'Chat',
  data () {
    return {
      loginData: null,
      isLogin: false,
      token: null
    }
  },
  mounted () {
    this.initialize()
    this.startSessionTimeout()
  },
  methods: {
    initialize () {
      const storedLoginData = JSON.parse(localStorage.getItem('userData'))
      if (storedLoginData) {
        this.loginData = storedLoginData
        this.isLogin = true
      }
    },
    async logout () {
      try {
        const result = await this.$swal({
          title: 'ยืนยันการออกจากระบบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#949698',
          confirmButtonText: 'ออกจากระบบ',
          cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
          localStorage.removeItem('authPayrollToken')
          sessionStorage.removeItem('authPayrollToken')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')

          this.$router.push('/')
        }
      } catch (err) {
        await this.$swal({
          icon: 'error',
          title: 'ไม่สามารถออกจากระบบได้',
          text: 'เกิดข้อผิดพลาดขณะพยายามออกจากระบบ'
        })
      }
    },

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
    },
    startSessionTimeout () {
      setTimeout(() => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('userData')

        this.$swal({
          icon: 'warning',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่'
        }).then(() => {
          this.$router.push('/')
        })
      }, 30 * 60 * 1000)
    }
  }
}
</script>

<style>
</style>

import { clearAuth } from '~/utils/auth'

export default function ({ $axios, redirect, $swal, store }) {
  $axios.onRequest((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  $axios.onError(async (error) => {
    const status = error.response?.status
    const cause = error.response?.data?.cause

    if (status === 401) {
      const expired = cause === 'expired token' || cause === 'invalid signature'
      await $swal({
        icon: expired ? 'info' : 'error',
        title: expired ? 'เซสชันหมดอายุ' : 'ไม่ได้รับอนุญาต',
        text: expired ? 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง' : 'ไม่สามารถเข้าถึงข้อมูลได้',
        confirmButtonText: 'ตกลง'
      })

      clearAuth()
      if (store) { store.commit('setUserData', null) }
      redirect('/login')
      return
    }

    throw error
  })
}

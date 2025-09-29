export default function ({ $axios, redirect, $swal }) {
  $axios.onRequest((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // console.log('[Axios] Attached token:', token)
    } else {
      console.warn('[Axios] No token found in localStorage')
    }
    return config
  })
  $axios.onError(async (error) => {
    const status = error.response?.status
    const cause = error.response?.data?.cause

    if (status === 401) {
      if (cause === 'expired token') {
        await $swal({
          icon: 'info',
          title: 'Session หมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่',
          confirmButtonText: 'ปิด'
        })
      } else {
        await $swal({
          icon: 'error',
          title: 'Unauthorized',
          text: 'ไม่สามารถเข้าถึงข้อมูลได้'
        })
      }

      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      redirect('/')
      return
    }

    throw error
  })
}

export default function ({ $axios, redirect, route, store, $swal, $loadEnd }) {
  $axios.onError(async (error) => {
    if (error.response?.data?.cause === 'expired token') {
      $loadEnd()
      await $swal({
        icon: 'info',
        title: 'session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        confirmButtonText: 'ปิด',
        confirmButtonColor: 'rgba(0, 90, 170, 1)'
      })
      redirect('/')
      return false
    }
    $loadEnd()
    throw error
  })
}

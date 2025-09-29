import { Loading } from 'notiflix'

const Notiflix = {

  Loading () {
    Loading.standard(
      'กำลังโหลด กรุณารอสักครู่',
      {
        svgSize: '200px',
        messageFontSize: '30px',
        svgColor: '#FC6'
      }
    )
  },
  Remove () {
    Loading.remove()
  },
  LoadingPic () {
    Loading.hourglass('กำลังเข้าสู่ระบบ กรุณารอสักครู่', {
      svgSize: '200px',
      messageFontSize: '30px',
      svgColor: '#FC6'
    })
  }
}

export default ({ app }, inject) => {
  inject('Notiflix', Notiflix)
}

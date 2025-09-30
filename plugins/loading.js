import { Loading } from 'notiflix'

const Notiflix = {

  Loading () {
    Loading.standard(
      {
        svgSize: '100px',
        messageFontSize: '30px',
        svgColor: 'rgba(210, 103, 252, 1)'
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

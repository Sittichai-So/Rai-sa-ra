import Vue from 'vue'
import {
  ValidationObserver,
  ValidationProvider,
  extend
} from 'vee-validate'
// eslint-disable-next-line camelcase
import { required, min, max, numeric, email, regex, confirmed } from 'vee-validate/dist/rules'

extend('required', {
  ...required,
  message: 'กรุณาระบุ'
})

extend('requiredselect', {
  ...required,
  message: 'กรุณาเลือก'
})

extend('email', {
  ...email,
  message: 'กรุณากรอกอีเมลที่ถูกต้อง'
})

extend('regex', {
  ...regex,
  message: 'รหัสผ่านต้องประกอบด้วย A-Z, a-z, 0-9'
})

extend('confirmed', {
  ...confirmed,
  message: 'รหัสผ่านไม่ตรงกัน'
})

extend('min', {
  ...min,
  message: 'ต้องมีความยาวอย่างน้อย {length} ตัวอักษร'
})

extend('max', {
  ...max,
  message: 'ต้องมีความยาวไม่เกิน {length} ตัวอักษร'
})

extend('numeric', {
  ...numeric,
  message: 'ระบุตัวเลขเท่านั้น'
})

extend('MobileValidate', {
  validate (value) {
    const MOBILEREG = /^\(?(0[689]{1}[0-9]{1})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)
    if (MOBILEREG) {
      return true
    } else {
      return 'กรุณาระบุเบอร์โทรศัพท์มือถือให้ถูกต้อง'
    }
  }
})

extend('thaiID', {
  validate (value) {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseFloat(value.charAt(i)) * (13 - i)
    }
    if ((11 - sum % 11) % 10 !== parseFloat(value.charAt(12))) { return 'เลขบัตรประชาชนไม่ถูกต้อง' }
    return true
  }
})

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

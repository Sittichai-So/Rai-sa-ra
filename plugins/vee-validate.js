import Vue from 'vue'
import {
  ValidationObserver,
  ValidationProvider,
  extend
} from 'vee-validate'
// eslint-disable-next-line camelcase
import { required, min, max, numeric } from 'vee-validate/dist/rules'
// import { required, email } from 'vee-validate/dist/rules'

extend('required', {
  ...required,
  message: 'กรุณาระบุ'
})

extend('requiredselect', {
  ...required,
  message: 'กรุณาเลือก'
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

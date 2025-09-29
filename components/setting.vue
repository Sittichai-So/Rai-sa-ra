<template>
  <b-modal
    v-model="showCreateRoom"
    title="สร้างช่องทางใหม่"
    centered
    hide-footer
    body-class="create-room-modal-body"
  >
    <b-form class="create-room-form" @submit.stop.prevent="createRoom">
      <b-form-group label="ชื่อช่องทาง" label-for="roomName">
        <b-form-input
          id="roomName"
          v-model="newRoom.name"
          type="text"
          placeholder="ระบุชื่อช่องทาง"
          required
        />
      </b-form-group>

      <div class="form-actions">
        <b-button variant="secondary">
          ยกเลิก
        </b-button>
        <b-button type="submit" variant="primary">
          บันทึก
        </b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: 'Setting',
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style>
</style>

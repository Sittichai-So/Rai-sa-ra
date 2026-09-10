<template>
  <div>
    <Nuxt />
  </div>
</template>

<script>

export default {
  data () {
    return {
      isLogin: false
    }
  },
  methods: {
  }
}
</script>

<style>

html {
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body{
  padding: 0;
  position: relative;
  font-family: 'thai_sans_literegular';
  background-color: #0c0b10;
  font-size: 1rem;
  min-height: 100vh;
  min-height: 100dvh;
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
  font-size: 0.875rem;
}

.custom-select {
  font-size: 1rem;
}

.form-control {
  font-size: 1rem;
}

.container {
  max-width: 1200px;
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

@media screen and (max-width: 600px) {
  #Col-MainContant {
    padding-top: 20px;
  }
}

</style>

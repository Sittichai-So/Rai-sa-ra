<template>
  <div>
    <Nuxt />
  </div>
</template>

<script>

export default {
  components: {

  }
}
</script>

<style>

html {
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
  background-color: #f5f8fa;
  font-size: 22px;
  min-height:100vh;
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
  font-size: 20px;
}

.custom-select {
  font-size: 1.3rem;
}

.form-control {
  font-size: 18px;
}

@media screen and (max-width: 600px) {
  #Col-MainContant {
    padding-top: 20px;
  }
}

</style>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  components: {}
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Inter:500,900&display=swap");

body,
html {
  margin: 0px;
  height: 100%;
  width: 100%;
  background: black;
}

ul {
  list-style: none;
  margin-left: 0px;
  padding-left: 0px;
  margin: 0px;
}

#app {
  height: 100%;
  width: 100%;
  font-family: Inter, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-weight: 900;
  font-size: 48px;
}

* {
  box-sizing: border-box;
}
</style>

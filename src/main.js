import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VuePlyr from 'vue-plyr'
 
Vue.use(VueAxios, axios)
Vue.config.productionTip = false
Vue.use(VuePlyr, {
    plyr: {
        fullscreen: { enabled: false },
        autoplay: true
    },
    emit: ['ended']
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io';

Vue.use(Vuetify)
Vue.use(VueSocketio, 'http://52.67.214.31:8080');
//Vue.use(VueSocketio, 'http://localhost:8080');
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

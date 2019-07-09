import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
    theme: {
      primary: '#1F3270',
      secondary: '#b0bec5',
      accent: '#1F3270',
      error: '#b71c1c',
    },
  options: {
    customProperties: true
  }
});

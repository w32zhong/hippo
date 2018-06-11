import Vue from 'vue'
import VueRouter from 'vue-router'
import hippoApp from './app.vue'
import routeIndex from './route-index.vue'

Vue.use(VueRouter)

const router = new VueRouter({
	mode: 'history',
	routes: [
		{
			path: '/:dirname/:filename',
			component: routeIndex
		}
	]
})

new Vue({
  el: '#hippo',
  router,
  render: h => h(hippoApp)
})

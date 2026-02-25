import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPlus from 'uview-plus'
import * as Pinia from "pinia";

export function createApp() {
	const app = createSSRApp(App);
	const pinia = Pinia.createPinia();
	app.use(uviewPlus);
	app.use(pinia);
	return {
		app,
		Pinia
	};
}

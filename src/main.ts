import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import zhCN from './i18n/zh-CN.json';
import enUS from './i18n/en-US.json';

import 'virtual:uno.css';

// Font Awesome 配置
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faHome, faMusic, faFileAudio, faStopwatch, faPenToSquare, faClock,
  faPlay, faPause, faBackwardStep, faForwardStep, faVolumeHigh, faVolumeLow,
  faDownload, faUpload, faCloudUploadAlt, faSearch, faPlus, faWandMagic, faTimeline,
  faLocationDot, faArrowsRotate, faCheck, faCircleHalfStroke, faCircle,
  faBatteryFull, faBatteryHalf, faStop, faDroplet, faBolt, faGear, faBell,
  faMicrophone, faRotate, faChartLine, faPersonRunning, faTrophy,
  faMedal, faAward, faExclamation, faXmark, faCircle as faCircleRegular,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faHome, faMusic, faFileAudio, faStopwatch, faPenToSquare, faClock,
  faPlay, faPause, faBackwardStep, faForwardStep, faVolumeHigh, faVolumeLow,
  faDownload, faUpload, faCloudUploadAlt, faSearch, faPlus, faWandMagic, faTimeline,
  faLocationDot, faArrowsRotate, faCheck, faCircleHalfStroke, faCircle,
  faBatteryFull, faBatteryHalf, faStop, faDroplet, faBolt, faGear, faBell,
  faMicrophone, faRotate, faChartLine, faPersonRunning, faTrophy,
  faMedal, faAward, faExclamation, faXmark, faCircleRegular
);

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');

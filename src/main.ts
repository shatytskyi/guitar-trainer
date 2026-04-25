import './styles/global.css';
import { startApp } from './app';

const host = document.getElementById('app');
if (!host) throw new Error('#app element not found');
startApp(host);

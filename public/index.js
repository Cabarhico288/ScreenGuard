import { registerRootComponent } from 'expo';
import App from '../App.web'; // or './App' if you don't have a separate web file
import 'leaflet/dist/leaflet.css';
registerRootComponent(App);

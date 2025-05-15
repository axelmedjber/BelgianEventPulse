import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import mapboxgl from 'mapbox-gl';

// Set Mapbox access token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

createRoot(document.getElementById("root")!).render(<App />);

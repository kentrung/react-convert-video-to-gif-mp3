import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/react-convert-video-to-gif-mp3/", // YOUR REPO NAME HERE
});

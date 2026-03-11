import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), checker({
        typescript: true,
        eslint: {
            lintCommand: 'eslint .',
            useFlatConfig: true,
        },
        overlay: {
            initialIsOpen: false,
        },
    }), cloudflare()],
    base: '/',
});
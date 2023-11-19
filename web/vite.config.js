import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    publicPath: '',
    base: '/',
    json: {
        stringify: true
    },
    build: {
        minify: 'esbuild',

    }
})
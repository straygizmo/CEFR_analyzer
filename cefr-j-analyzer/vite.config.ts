import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'

// Polyfill for crypto.hash (Node.js < 20.12.0)
if (!crypto.hash) {
  crypto.hash = ((algorithm: string, data: crypto.BinaryLike, encoding?: crypto.BinaryToTextEncoding | 'buffer') => {
    const hash = crypto.createHash(algorithm)
    hash.update(data)
    if (encoding === 'buffer' || !encoding) {
      return hash.digest()
    }
    return hash.digest(encoding as crypto.BinaryToTextEncoding)
  }) as any
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['wink-nlp', 'wink-eng-lite-web-model'],
  },
  build: {
    commonjsOptions: {
      include: [/wink-nlp/, /wink-eng-lite-web-model/, /node_modules/],
    },
  },
})

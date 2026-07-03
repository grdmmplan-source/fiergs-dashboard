import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'

// Workaround para drive de rede mapeado nesta operacao (H:/K:/Z: apontam para
// o mesmo compartilhamento \\192.168.1.20\ddmrj-dados\Planejamento). O Vite
// resolve o path interno como Z: e conflita com a letra usada para rodar o
// build. Fixamos a raiz em Z: SOMENTE quando esse caminho existe; em qualquer
// outra maquina cai no comportamento padrao do Vite.
const networkRoot = 'Z:/DAILY/FIERGS'
const root = existsSync(networkRoot) ? networkRoot : undefined

export default defineConfig({
  ...(root ? { root } : {}),
  plugins: [react()],
  base: '/fiergs-dashboard/',
})

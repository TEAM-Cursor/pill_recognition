import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
// basicSsl: dev 서버를 자체 서명 HTTPS로 띄운다 — 폰(LAN)에서 카메라(getUserMedia)를
// 쓰려면 보안 컨텍스트가 필요하기 때문. 폰 첫 접속 시 인증서 경고 1회는 무시하면 된다.
export default defineConfig({
  plugins: [react(), basicSsl()],
})

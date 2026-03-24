import { onMounted } from 'vue'
import { Notify } from 'quasar'

const CHECK_INTERVAL = 30 * 60 * 1000 // 30分钟
const GITHUB_API = 'https://api.github.com/repos/YOUR_USER/YOUR_REPO/commits/main'

export function useVersionCheck() {
  const currentVersion = process.env.APP_VERSION

  const checkForUpdate = async () => {
    // 无网时跳过
    if (!navigator.onLine) {
      console.log('[VersionCheck] 离线状态，跳过检查')
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(GITHUB_API, {
        signal: controller.signal,
        cache: 'no-store'
      })

      clearTimeout(timeout)

      if (!response.ok) throw new Error('API error')

      const data = await response.json()
      const latestCommit = data.sha.substring(0, 7)

      // 如果 commit 不同，触发 SW 更新检查
      if (latestCommit !== currentVersion) {
        console.log(`[VersionCheck] 发现新版本: ${latestCommit}`)

        // 触发 Service Worker 更新
        const registration = await navigator.serviceWorker.ready
        await registration.update()
      }
    } catch (error) {
      // 静默处理
      console.log('[VersionCheck] 检查失败:', error.message)
    }
  }

  onMounted(() => {
    // 页面可见时检查
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate()
      }
    })

    // 网络恢复时检查
    window.addEventListener('online', checkForUpdate)

    // 初始检查（延迟5秒）
    setTimeout(checkForUpdate, 5000)
  })

  return { checkForUpdate }
}

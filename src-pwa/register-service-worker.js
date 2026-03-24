import { register } from 'register-service-worker'
import { Notify } from 'quasar'

let updateNotification = null

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (registration) {
    // 定期检查更新（只在有网时）
    setInterval(() => {
      if (navigator.onLine) {
        registration.update().catch(() => {
          // 静默处理错误（如无网时的失败）
        })
      }
    }, 30 * 60 * 1000) // 30分钟
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (registration) {
    // 关闭旧通知
    if (updateNotification) {
      updateNotification()
    }

    // 显示更新提示
    updateNotification = Notify.create({
      message: '发现新版本',
      caption: '点击更新使用最新功能',
      color: 'primary',
      icon: 'system_update',
      timeout: 0,
      position: 'top',
      actions: [
        {
          label: '稍后',
          color: 'white',
          handler: () => { }
        },
        {
          label: '立即更新',
          color: 'yellow',
          handler: () => {
            if (registration && registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          }
        }
      ]
    })
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})

// 监听新的 SW 激活，自动刷新页面
let refreshing = false
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return
  refreshing = true
  window.location.reload()
})

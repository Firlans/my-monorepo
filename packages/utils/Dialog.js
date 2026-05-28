import { createApp, markRaw } from 'vue'
import BaseDialog from '../components/features/BaseDialog.vue'

const POSITION_CLASS = {
  top: 'items-start',
  bottom: 'items-end',
  center: 'items-center',
  middle: 'items-center'
}

const normalizeButton = (button, fallbackValue) => {
  if (!button) return null

  if (typeof button === 'string') {
    return {
      label: button,
      value: fallbackValue
    }
  }

  return {
    label: button.label || button.text || String(button.value ?? ''),
    value: button.value ?? fallbackValue,
    className: button.className || ''
  }
}

const resolvePositionClass = (position) => {
  const key = String(position || 'center').trim().toLowerCase()
  return POSITION_CLASS[key] || POSITION_CLASS.center
}

class Dialog {
  constructor(component, position = 'center', okButton, closeButton) {
    if (!component) {
      throw new Error('Dialog membutuhkan komponen untuk dirender')
    }

    this.component = markRaw(component)
    this.position = position
    this.okButton = normalizeButton(okButton, true)
    this.closeButton = normalizeButton(closeButton, false)
    this.app = null
    this.container = null
    this.pendingPromise = null
    this.resolvePromise = null
    this.latestData = null
    this.handleEscape = this.handleEscape.bind(this)
  }

  open() {
    if (this.pendingPromise) {
      return this.pendingPromise
    }

    this.pendingPromise = new Promise((resolve) => {
      this.resolvePromise = resolve
      this.mount()
    })

    return this.pendingPromise
  }

  ok(payload = this.latestData) {
    this.finish({ action: 'ok', data: payload })
  }

  close(payload = this.latestData) {
    this.finish({ action: 'close', data: payload })
  }

  dismiss(payload = this.latestData) {
    this.finish({ action: 'dismiss', data: payload })
  }

  resolve(action = 'ok', payload = this.latestData) {
    this.finish({ action, data: payload })
  }

  mount() {
    this.container = document.createElement('div')
    document.body.appendChild(this.container)

    this.app = createApp(BaseDialog, {
      dialog: this,
      component: this.component,
      positionClass: resolvePositionClass(this.position),
      okButton: this.okButton,
      closeButton: this.closeButton
    })
    this.app.mount(this.container)

    window.addEventListener('keydown', this.handleEscape)
  }

  handleEscape(event) {
    if (event.key !== 'Escape') return
    if (!this.pendingPromise) return

    if (this.closeButton) {
      this.close(this.closeButton.value)
      return
    }

    this.dismiss()
  }

  finish(result) {
    if (!this.resolvePromise) return

    const resolve = this.resolvePromise
    this.resolvePromise = null
    this.pendingPromise = null
    this.latestData = null

    this.destroy()
    resolve(result)
  }

  destroy() {
    window.removeEventListener('keydown', this.handleEscape)

    if (this.app) {
      this.app.unmount()
      this.app = null
    }

    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }

    this.container = null
  }
}

export { Dialog }
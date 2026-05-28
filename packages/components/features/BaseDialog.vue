<script setup>
import { ref } from 'vue'

const emit = defineEmits(['ok', 'close', 'dismiss', 'dialog-update'])

const props = defineProps({
  dialog: {
    type: Object,
    default: null
  },
  component: {
    type: [Object, Function],
    default: null
  },
  positionClass: {
    type: String,
    default: 'items-center'
  },
  okButton: {
    type: Object,
    default: null
  },
  closeButton: {
    type: Object,
    default: null
  }
})

const contentData = ref(null)

const setDialogData = (payload) => {
  contentData.value = payload

  if (props.dialog) {
    props.dialog.latestData = payload
  }

  emit('dialog-update', payload)
}

const onOk = (payload) => {
  const finalPayload = payload === undefined ? contentData.value : payload

  if (props.dialog) {
    props.dialog.ok(finalPayload)
    return
  }

  emit('ok', finalPayload)
}

const onClose = (payload) => {
  const finalPayload = payload === undefined ? contentData.value : payload

  if (props.dialog) {
    props.dialog.close(finalPayload)
    return
  }

  emit('close', finalPayload)
}

const onBackdropClick = (event) => {
  if (event.target !== event.currentTarget) return

  if (props.closeButton) {
    onClose(props.closeButton.value)
    return
  }

  if (props.dialog) {
    props.dialog.dismiss()
    return
  }

  emit('dismiss', contentData.value)
}
</script>

<template>
  <div
    :class="`fixed inset-0 z-50 flex justify-center bg-slate-900/40 p-4 ${positionClass}`"
    @click="onBackdropClick"
  >
    <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
      <component
        v-if="component"
        :is="component"
        :dialog="dialog"
        @dialog-update="setDialogData"
        @dialog-ok="onOk"
        @dialog-close="onClose"
      />

      <slot
        v-else
        :dialog="dialog"
        :set-dialog-data="setDialogData"
        :ok="onOk"
        :close="onClose"
      />

      <div v-if="okButton || closeButton" class="mt-4 grid grid-cols-2 gap-3">
        <slot
          name="footer"
          :dialog="dialog"
          :ok="onOk"
          :close="onClose"
          :ok-button="okButton"
          :close-button="closeButton"
        >
          <button
            v-if="closeButton"
            type="button"
            :class="`rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${closeButton.className || ''}`"
            @click="onClose(closeButton.value)"
          >
            {{ closeButton.label }}
          </button>

          <button
            v-if="okButton"
            type="button"
            :class="`rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 ${okButton.className || ''}`"
            @click="onOk(okButton.value)"
          >
            {{ okButton.label }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-backdrop"
        @click.self="handleBackdropClick"
        @keydown.esc="handleClose"
        tabindex="-1"
      >
        <div
          class="modal-container"
          :style="{ maxWidth: maxWidth || '560px' }"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-group">
              <span v-if="icon" class="modal-icon" aria-hidden="true">{{ icon }}</span>
              <div>
                <h3 class="modal-title">{{ title }}</h3>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              @click="handleClose"
              title="Kapat"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer (isteğe bağlı) -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    icon?: string
    maxWidth?: string
    closeOnBackdrop?: boolean
  }>(),
  {
    subtitle: '',
    icon: '',
    maxWidth: '560px',
    closeOnBackdrop: true
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

// ESC tuşuyla kapatma desteği
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(50, 35, 23, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  width: 100%;
  background: #fffdfa;
  border: 1px solid #e7d5c3;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(70, 45, 25, 0.22);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 26px;
  border-bottom: 1px solid #ebd9c8;
  background: linear-gradient(135deg, #fffdf9 0%, #fbf4ec 100%);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  color: #493122;
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  margin: 3px 0 0;
  color: #8c735d;
  font-size: 13px;
  line-height: 1.4;
}

.modal-close-btn {
  background: #f4e8dc;
  border: 1px solid #e2c9b1;
  color: #6a4a33;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #c34e3d;
  border-color: #b03f30;
  color: #ffffff;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px 26px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 26px;
  border-top: 1px solid #ebd9c8;
  background: #fbf5ee;
}

/* Animasyonlar */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>

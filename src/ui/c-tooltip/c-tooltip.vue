<script setup lang="ts">
const props = withDefaults(defineProps<{ tooltip?: string, position?: 'top' | 'bottom' | 'left' | 'right' }>(), {
  tooltip: undefined,
  position: 'top',
});
const { tooltip, position } = toRefs(props);

const targetRef = ref();
const isTargetHovered = useElementHover(targetRef);
</script>

<template>
  <div relative inline-block>
    <div ref="targetRef">
      <slot />
    </div>

    <div
      v-if="tooltip || $slots.tooltip"
      class="kt-ctip absolute z-10 whitespace-nowrap transition transition transition-duration-0.2s"
      :class="{
        'op-0 scale-0': isTargetHovered === false,
        'op-100 scale-100': isTargetHovered,
        'bottom-100% left-50% -translate-x-1/2 mb-5px': position === 'top',
        'top-100% left-50% -translate-x-1/2 mt-5px': position === 'bottom',
        'right-100% top-50% -translate-y-1/2 mr-5px': position === 'left',
        'left-100% top-50% -translate-y-1/2 ml-5px': position === 'right',
      }"
    >
      <slot
        v-if="isTargetHovered"
        name="tooltip"
      >
        {{ tooltip }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Family tooltip chrome: modal tone, pane border, rounded (matches the
   data-tip tooltips in kt-terminal.css) */
.kt-ctip {
  background: var(--kt-modal, #141414);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--kt-chrome-border, #1f1f1f);
  border-radius: 6px;
  padding: 4px 10px;
  font-family: Consolas, monospace;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

html:not(.dark) .kt-ctip {
  color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}
</style>

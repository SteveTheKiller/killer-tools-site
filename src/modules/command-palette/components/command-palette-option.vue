<script setup lang="ts">
import type { PaletteOption } from '../command-palette.types';

const props = withDefaults(defineProps<{ option: PaletteOption, selected?: boolean }>(), {
  selected: false,
});
const emit = defineEmits(['activated']);
const { option } = toRefs(props);

const { selected } = toRefs(props);
</script>

<template>
  <div
    role="option"
    :aria-selected="selected"
    :class="{
      'text-primary': selected,
      'bg-[rgba(0,0,0,0.50)]': selected,
    }"
    w-full flex cursor-pointer items-center overflow-hidden rounded pa-3 transition hover:bg-[rgba(0,0,0,0.50)] hover:text-primary
    @click="() => emit('activated', option)"
  >
    <component :is="option.icon" v-if="option.icon" mr-3 h-30px w-30px shrink-0 op-50 />

    <div flex-1 overflow-hidden>
      <div truncate font-bold lh-tight op-90>
        {{ option.name }}
      </div>

      <div v-if="option.description" truncate lh-tight op-60>
        {{ option.description }}
      </div>
    </div>
  </div>
</template>

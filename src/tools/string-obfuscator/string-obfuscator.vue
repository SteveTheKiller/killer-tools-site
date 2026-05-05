<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useObfuscateString } from './string-obfuscator.model';

const str = ref('Lorem ipsum dolor sit amet');
const keepFirst = ref(4);
const keepLast = ref(4);
const keepSpace = ref(true);

const obfuscatedString = useObfuscateString(str, { keepFirst, keepLast, keepSpace });
const { copy } = useCopy({ source: obfuscatedString });
</script>

<template>
  <div>
    <c-input-text v-model:value="str" raw-text placeholder="Enter string to obfuscate" label="String to obfuscate:" clearable multiline />

    <div mt-4 flex flex-wrap gap-10px items-end>
      <c-input-text
        v-model:value="keepFirst"
        label="Keep first:"
        type="number"
        style="width: 110px;"
        raw-text
      />
      <c-input-text
        v-model:value="keepLast"
        label="Keep last:"
        type="number"
        style="width: 110px;"
        raw-text
      />
      <div>
        <div class="so-label">Keep spaces:</div>
        <button
          type="button"
          class="kt-pill"
          :class="{ 'kt-pill-active': keepSpace }"
          @click="keepSpace = !keepSpace"
        >
          {{ keepSpace ? 'On' : 'Off' }}
        </button>
      </div>
    </div>

    <c-card v-if="obfuscatedString" mt-60px max-w-600px flex items-center gap-5px font-mono>
      <div break-anywhere text-wrap>
        {{ obfuscatedString }}
      </div>

      <c-button @click="copy()">
        <icon-mdi:content-copy />
      </c-button>
    </c-card>
  </div>
</template>

<style scoped>
.so-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 6px;
}
</style>

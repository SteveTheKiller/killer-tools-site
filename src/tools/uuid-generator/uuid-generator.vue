<script setup lang="ts">
import { v1 as generateUuidV1, v3 as generateUuidV3, v4 as generateUuidV4, v5 as generateUuidV5, NIL as nilUuid } from 'uuid';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { withDefaultOnError } from '@/utils/defaults';

const versions = ['NIL', 'v1', 'v3', 'v4', 'v5'] as const;
type Version = typeof versions[number];

const version = useStorage<Version>('uuid-generator:version', 'v4');
const count = useStorage('uuid-generator:quantity', 1);
const v35Namespace = ref('6ba7b811-9dad-11d1-80b4-00c04fd430c8');
const v35Name = ref('');

const namespacePresets = [
  { label: 'DNS', value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
  { label: 'URL', value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8' },
  { label: 'OID', value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8' },
  { label: 'X500', value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8' },
];

const isV35 = computed(() => version.value === 'v3' || version.value === 'v5');

const namespaceValid = computed(() =>
  v35Namespace.value === nilUuid
  || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v35Namespace.value),
);

const generators = {
  NIL: () => nilUuid,
  v1: (index: number) => generateUuidV1({
    clockseq: index,
    msecs: Date.now(),
    nsecs: Math.floor(Math.random() * 10000),
    node: Uint8Array.from({ length: 6 }, () => Math.floor(Math.random() * 256)),
  }),
  v3: () => generateUuidV3(v35Name.value, v35Namespace.value),
  v4: () => generateUuidV4(),
  v5: () => generateUuidV5(v35Name.value, v35Namespace.value),
};

const [uuids, refreshUUIDs] = computedRefreshable(() => withDefaultOnError(() =>
  Array.from({ length: count.value }, (_ignored, index) => {
    const generator = generators[version.value] ?? generators.NIL;
    return generator(index);
  }).join('\n'), ''));

const { copy } = useCopy({ source: uuids, text: 'UUIDs copied to the clipboard' });
</script>

<template>
  <div class="uu-wrap">
    <div class="uu-panel">
      <!-- Version selector -->
      <div class="uu-field">
        <span class="uu-sublabel">VERSION</span>
        <div class="uu-toggle-group">
          <button
            v-for="v in versions"
            :key="v"
            type="button"
            class="uu-toggle"
            :class="{ 'uu-toggle-on': version === v }"
            @click="version = v"
          >
            {{ v }}
          </button>
        </div>
      </div>

      <!-- Quantity -->
      <div class="uu-field">
        <span class="uu-sublabel">QUANTITY</span>
        <div class="uu-stepper">
          <button class="uu-step-btn" :disabled="count <= 1" @click="count = Math.max(1, count - 1)">
            −
          </button>
          <span class="uu-step-val">{{ count }}</span>
          <button class="uu-step-btn" :disabled="count >= 50" @click="count = Math.min(50, count + 1)">
            +
          </button>
        </div>
      </div>

      <!-- v3/v5 namespace + name -->
      <template v-if="isV35">
        <div class="uu-field">
          <span class="uu-sublabel">NAMESPACE PRESET</span>
          <div class="uu-toggle-group">
            <button
              v-for="p in namespacePresets"
              :key="p.label"
              type="button"
              class="uu-toggle"
              :class="{ 'uu-toggle-on': v35Namespace === p.value }"
              @click="v35Namespace = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="uu-field">
          <span class="uu-sublabel">NAMESPACE UUID</span>
          <input
            v-model="v35Namespace"
            class="uu-input"
            :class="{ 'uu-input-error': !namespaceValid }"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            spellcheck="false"
          >
          <span v-if="!namespaceValid" class="uu-error-msg">Invalid UUID</span>
        </div>

        <div class="uu-field">
          <span class="uu-sublabel">NAME</span>
          <input
            v-model="v35Name"
            class="uu-input"
            placeholder="Name to hash..."
            spellcheck="false"
          >
        </div>
      </template>

      <!-- Output -->
      <div class="uu-output-wrap">
        <span class="uu-sublabel">OUTPUT</span>
        <div class="uu-output">
          <pre class="uu-output-text">{{ uuids }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="uu-actions">
        <button type="button" class="uu-btn uu-btn-primary" autofocus @click="copy()">
          <icon-mdi-content-copy />
          Copy
        </button>
        <button type="button" class="uu-btn" @click="refreshUUIDs()">
          <icon-mdi-refresh />
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uu-wrap {
  flex: 1 1 480px;
  max-width: 720px;
}

.uu-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.uu-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.uu-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Toggle pills ── */
.uu-toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.uu-toggle {
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: all 0.15s;
}

.uu-toggle-on {
  border-color: #1ea54c;
  background: rgba(30, 165, 76, 0.15);
  color: #1ea54c;
}

/* ── Stepper ── */
.uu-stepper {
  display: inline-flex;
  align-items: center;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  align-self: flex-start;
}

.uu-step-btn {
  width: 30px;
  height: 32px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.12);
  color: #1ea54c;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}

.uu-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.uu-step-btn:hover:not(:disabled) {
  background: rgba(30, 165, 76, 0.1);
}

.uu-step-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.uu-step-val {
  min-width: 40px;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  padding: 0 4px;
}

/* ── Text inputs (v3/v5) ── */
.uu-input {
  width: 100%;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.uu-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.uu-input:focus {
  border-color: rgba(30, 165, 76, 0.55);
}

.uu-input-error {
  border-color: rgba(224, 85, 85, 0.5) !important;
}

.uu-error-msg {
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #e05555;
}

/* ── Output ── */
.uu-output-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.uu-output {
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.15);
  border-radius: 5px;
  padding: 10px 14px;
  min-height: 42px;
}

.uu-output-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: #1ea54c;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
}

/* ── Actions ── */
.uu-actions {
  display: flex;
  gap: 8px;
}

.uu-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30, 165, 76, 0.35);
  background: transparent;
  color: rgba(30, 165, 76, 0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.uu-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.65);
  color: #1ea54c;
}

.uu-btn-primary {
  background: rgba(30, 165, 76, 0.12);
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}

.uu-btn-primary:hover {
  background: rgba(30, 165, 76, 0.22);
  border-color: #1ea54c;
}
</style>

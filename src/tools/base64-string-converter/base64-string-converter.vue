<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { base64ToText, isValidBase64, textToBase64 } from '@/utils/base64';
import { withDefaultOnError } from '@/utils/defaults';

const encodeUrlSafe = useStorage('base64-string-converter--encode-url-safe', false);
const decodeUrlSafe = useStorage('base64-string-converter--decode-url-safe', false);

const textInput = ref('');
const base64Output = computed(() => textToBase64(textInput.value, { makeUrlSafe: encodeUrlSafe.value }));
const { copy: copyTextBase64, isJustCopied: copiedEncode } = useCopy({ source: base64Output, text: 'Base64 string copied to the clipboard' });

const base64Input = ref('');
const b64IsValid = computed(() =>
  base64Input.value === '' || isValidBase64(base64Input.value.trim(), { makeUrlSafe: decodeUrlSafe.value }),
);
const textOutput = computed(() =>
  withDefaultOnError(() => base64ToText(base64Input.value.trim(), { makeUrlSafe: decodeUrlSafe.value }), ''),
);
const { copy: copyText, isJustCopied: copiedDecode } = useCopy({ source: textOutput, text: 'String copied to the clipboard' });
</script>

<template>
  <!-- Encode panel -->
  <div class="b6-panel">
    <div class="b6-panel-header">
      <span class="b6-panel-title">STRING TO BASE64</span>
    </div>
    <div class="b6-body">
      <div class="b6-pill-row">
        <span class="b6-label">ENCODING</span>
        <div class="b6-pills">
          <button type="button" class="b6-pill" :class="{ 'b6-pill-active': !encodeUrlSafe }" @click="encodeUrlSafe = false">
            Standard
          </button>
          <button type="button" class="b6-pill" :class="{ 'b6-pill-active': encodeUrlSafe }" @click="encodeUrlSafe = true">
            URL Safe
          </button>
        </div>
      </div>

      <div class="b6-field">
        <span class="b6-label">STRING TO ENCODE</span>
        <textarea
          v-model="textInput"
          class="b6-textarea"
          placeholder="Put your string here..."
          rows="5"
          spellcheck="false"
        />
      </div>

      <div class="b6-field">
        <span class="b6-label">BASE64 OUTPUT</span>
        <textarea
          class="b6-textarea b6-textarea-output"
          :value="base64Output"
          placeholder="The base64 encoding of your string will be here"
          rows="5"
          readonly
          spellcheck="false"
        />
      </div>

      <div class="b6-actions">
        <button class="b6-btn b6-btn-accent" @click="copyTextBase64()">
          <icon-mdi-check v-if="copiedEncode" />
          <icon-mdi-content-copy v-else />
          {{ copiedEncode ? 'Copied!' : 'Copy base64' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Decode panel -->
  <div class="b6-panel">
    <div class="b6-panel-header">
      <span class="b6-panel-title">BASE64 TO STRING</span>
    </div>
    <div class="b6-body">
      <div class="b6-pill-row">
        <span class="b6-label">ENCODING</span>
        <div class="b6-pills">
          <button type="button" class="b6-pill" :class="{ 'b6-pill-active': !decodeUrlSafe }" @click="decodeUrlSafe = false">
            Standard
          </button>
          <button type="button" class="b6-pill" :class="{ 'b6-pill-active': decodeUrlSafe }" @click="decodeUrlSafe = true">
            URL Safe
          </button>
        </div>
      </div>

      <div class="b6-field">
        <span class="b6-label">BASE64 STRING TO DECODE</span>
        <textarea
          v-model="base64Input"
          class="b6-textarea"
          :class="{ 'b6-textarea-error': !b64IsValid }"
          placeholder="Your base64 string..."
          rows="5"
          spellcheck="false"
        />
        <span v-if="!b64IsValid" class="b6-error-msg">Invalid base64 string</span>
      </div>

      <div class="b6-field">
        <span class="b6-label">DECODED STRING</span>
        <textarea
          class="b6-textarea b6-textarea-output"
          :value="textOutput"
          placeholder="The decoded string will be here"
          rows="5"
          readonly
          spellcheck="false"
        />
      </div>

      <div class="b6-actions">
        <button class="b6-btn b6-btn-accent" @click="copyText()">
          <icon-mdi-check v-if="copiedDecode" />
          <icon-mdi-content-copy v-else />
          {{ copiedDecode ? 'Copied!' : 'Copy decoded string' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.b6-panel {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.b6-panel-header {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.15);
  background: rgba(30, 165, 76, 0.05);
}

.b6-panel-title {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #1ea54c;
}

.b6-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.b6-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.b6-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.b6-pill-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.b6-pills {
  display: flex;
  background: #0f0f11;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.b6-pill {
  padding: 5px 14px;
  background: transparent;
  border: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-right: 1px solid rgba(30, 165, 76, 0.15);
}

.b6-pill:last-child { border-right: none; }
.b6-pill:hover:not(.b6-pill-active) { background: rgba(30, 165, 76, 0.07); color: rgba(255, 255, 255, 0.65); }
.b6-pill-active { background: rgba(30, 165, 76, 0.15); color: #1ea54c; }

.b6-textarea {
  background: #0f0f11;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 8px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}

.b6-textarea:focus { border-color: rgba(30, 165, 76, 0.5); }
.b6-textarea::placeholder { color: rgba(255, 255, 255, 0.38); }
.b6-textarea-output { color: #1ea54c; cursor: default; resize: none; }
.b6-textarea-error { border-color: rgba(200, 50, 50, 0.5) !important; }

.b6-error-msg {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  color: #e05555;
}

.b6-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 4px;
}

.b6-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  background: #0f0f11;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.65);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.b6-btn:hover { background: rgba(30, 165, 76, 0.1); border-color: rgba(30, 165, 76, 0.5); color: #fff; }
.b6-btn-accent { border-color: rgba(30, 165, 76, 0.5); color: #1ea54c; }
.b6-btn-accent:hover { background: rgba(30, 165, 76, 0.15); color: #4dd07a; }
</style>

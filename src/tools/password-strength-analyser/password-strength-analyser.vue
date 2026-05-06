<script setup lang="ts">
import { getPasswordCrackTimeEstimation } from './password-strength-analyser.service';

const password = ref('');
const showPassword = ref(false);
const crackTimeEstimation = computed(() => getPasswordCrackTimeEstimation({ password: password.value }));

const score = computed(() => Math.round(crackTimeEstimation.value.score * 100));

const scoreColor = computed(() => {
  if (score.value >= 80) {
    return '#1ea54c';
  }
  if (score.value >= 50) {
    return '#e0a020';
  }
  if (score.value >= 25) {
    return '#e06020';
  }
  return '#e05555';
});

const scoreLabel = computed(() => {
  if (score.value >= 80) {
    return 'Strong';
  }
  if (score.value >= 50) {
    return 'Moderate';
  }
  if (score.value >= 25) {
    return 'Weak';
  }
  if (password.value.length === 0) {
    return '';
  }
  return 'Very weak';
});

const details = computed(() => [
  { label: 'Length', value: crackTimeEstimation.value.passwordLength },
  { label: 'Entropy', value: `${Math.round(crackTimeEstimation.value.entropy * 100) / 100} bits` },
  { label: 'Charset size', value: crackTimeEstimation.value.charsetLength },
  { label: 'Score', value: `${score.value} / 100` },
]);
</script>

<template>
  <div class="ps-wrap">
    <div class="ps-panel">
      <!-- Input -->
      <div class="ps-input-row">
        <input
          v-model="password"
          class="ps-input"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter a password..."
          autofocus
          data-test-id="password-input"
          spellcheck="false"
        >
        <button class="ps-icon-btn" :title="showPassword ? 'Hide' : 'Show'" @click="showPassword = !showPassword">
          <icon-mdi-eye-off v-if="showPassword" />
          <icon-mdi-eye v-else />
        </button>
        <button v-if="password" class="ps-icon-btn" title="Clear" @click="password = ''">
          <icon-mdi-close />
        </button>
      </div>

      <!-- Strength bar -->
      <div class="ps-bar-wrap">
        <div class="ps-bar-track">
          <div
            class="ps-bar-fill"
            :style="{ width: `${score}%`, background: scoreColor }"
          />
        </div>
        <div class="ps-bar-labels">
          <span class="ps-score-label" :style="{ color: scoreColor }">{{ scoreLabel }}</span>
          <span class="ps-score-val" :style="{ color: scoreColor }">{{ score }} / 100</span>
        </div>
      </div>

      <!-- Crack time -->
      <div class="ps-crack-block">
        <span class="ps-sublabel">BRUTE FORCE CRACK TIME</span>
        <span class="ps-crack-time" data-test-id="crack-duration">{{ crackTimeEstimation.crackDurationFormatted }}</span>
      </div>

      <!-- Details terminal rows -->
      <div class="ps-terminal">
        <div v-for="{ label, value } in details" :key="label" class="ps-row">
          <span class="ps-prompt">&gt;_</span>
          <span class="ps-detail-label">{{ label }}</span>
          <span class="ps-detail-value">{{ value }}</span>
        </div>
      </div>

      <!-- Note -->
      <p class="ps-note">
        Strength is estimated using brute force time at 1B guesses/sec. Dictionary attacks are not modelled.
      </p>
    </div>
  </div>
</template>

<style scoped>
.ps-wrap {
  flex: 1 1 480px;
  max-width: 720px;
}

/* ── Panel ── */
.ps-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Password input ── */
.ps-input-row {
  display: flex;
  align-items: center;
  background: #0f0f11;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.ps-input-row:focus-within {
  border-color: rgba(30, 165, 76, 0.55);
}

.ps-input {
  flex: 1 1 0;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.05em;
}

.ps-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: normal;
}

.ps-icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-left: 1px solid rgba(30, 165, 76, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: color 0.12s;
}

.ps-icon-btn:hover {
  color: rgba(255, 255, 255, 0.65);
}

/* ── Strength bar ── */
.ps-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ps-bar-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.ps-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.ps-bar-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ps-score-label {
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-weight: 600;
  transition: color 0.3s;
}

.ps-score-val {
  font-size: 0.68rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  opacity: 0.7;
  transition: color 0.3s;
}

/* ── Crack time ── */
.ps-crack-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(30, 165, 76, 0.12);
  border-radius: 6px;
}

.ps-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.ps-crack-time {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1ea54c;
}

/* ── Terminal rows ── */
.ps-terminal {
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.ps-row {
  display: grid;
  grid-template-columns: auto 120px 1fr;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  background: transparent !important;
}

.ps-row:hover {
  background: rgba(30, 165, 76, 0.05) !important;
}

.ps-row:last-child {
  border-bottom: none;
}

.ps-prompt {
  color: rgba(30, 165, 76, 0.4);
  font-size: 0.72rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-weight: 600;
  user-select: none;
}

.ps-detail-label {
  font-size: 0.74rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.4);
}

.ps-detail-value {
  font-size: 0.8rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: #1ea54c;
}

/* ── Note ── */
.ps-note {
  font-size: 0.7rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 0;
}
</style>

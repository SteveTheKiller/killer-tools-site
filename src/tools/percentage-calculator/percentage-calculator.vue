<script setup lang="ts">
function fmt(n: number) {
  return Number(n.toFixed(8)).toString();
}

// What is X% of Y
const pctX = ref('');
const pctY = ref('');
const pctResult = computed(() => {
  const x = Number.parseFloat(pctX.value);
  const y = Number.parseFloat(pctY.value);
  if (Number.isNaN(x) || Number.isNaN(y)) {
    return '';
  }
  return fmt(x / 100 * y);
});

// X is what percent of Y
const numX = ref('');
const numY = ref('');
const numResult = computed(() => {
  const x = Number.parseFloat(numX.value);
  const y = Number.parseFloat(numY.value);
  if (Number.isNaN(x) || Number.isNaN(y) || y === 0) {
    return '';
  }
  return `${fmt(100 * x / y)}%`;
});

// Percentage increase/decrease
const fromVal = ref('');
const toVal = ref('');
const changeResult = computed(() => {
  const from = Number.parseFloat(fromVal.value);
  const to = Number.parseFloat(toVal.value);
  if (Number.isNaN(from) || Number.isNaN(to) || from === 0) {
    return '';
  }
  const pct = (to - from) / from * 100;
  return `${pct >= 0 ? '+' : ''}${fmt(pct)}%`;
});

const copiedKey = ref<string | null>(null);
async function copyResult(key: string, val: string) {
  if (!val) {
    return;
  }
  await navigator.clipboard.writeText(val);
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) {
      copiedKey.value = null;
    }
  }, 2000);
}
</script>

<template>
  <div class="pc-wrap">
    <!-- What is X% of Y -->
    <div class="pc-panel kt-terminal">
      <div class="pc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">WHAT IS X% OF Y</span>
      </div>
      <div class="pc-row pc-body">
        <span class="pc-text">What is</span>
        <input v-model="pctX" class="pc-num" type="number" placeholder="X" data-test-id="percentageX">
        <span class="pc-text">% of</span>
        <input v-model="pctY" class="pc-num" type="number" placeholder="Y" data-test-id="percentageY">
        <span class="pc-eq">=</span>
        <div
          class="pc-result"
          :class="{ 'pc-result-active': pctResult }"
          data-test-id="percentageResult"
          @click="copyResult('pct', pctResult)"
        >
          <span v-if="pctResult" class="pc-result-val">{{ pctResult }}</span>
          <span v-else class="pc-result-empty">Result</span>
          <span v-if="pctResult" class="pc-result-copy">
            <span v-if="copiedKey === 'pct'">✓</span>
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </div>

    <!-- X is what percent of Y -->
    <div class="pc-panel kt-terminal">
      <div class="pc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">X IS WHAT PERCENT OF Y</span>
      </div>
      <div class="pc-row pc-body">
        <input v-model="numX" class="pc-num" type="number" placeholder="X" data-test-id="numberX">
        <span class="pc-text">is what % of</span>
        <input v-model="numY" class="pc-num" type="number" placeholder="Y" data-test-id="numberY">
        <span class="pc-eq">=</span>
        <div
          class="pc-result"
          :class="{ 'pc-result-active': numResult }"
          data-test-id="numberResult"
          @click="copyResult('num', numResult)"
        >
          <span v-if="numResult" class="pc-result-val">{{ numResult }}</span>
          <span v-else class="pc-result-empty">Result</span>
          <span v-if="numResult" class="pc-result-copy">
            <span v-if="copiedKey === 'num'">✓</span>
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </div>

    <!-- Percentage increase/decrease -->
    <div class="pc-panel kt-terminal">
      <div class="pc-panel-bar kt-terminal-bar">
        <span class="kt-terminal-bar-title">PERCENTAGE INCREASE / DECREASE</span>
      </div>
      <div class="pc-row pc-body">
        <span class="pc-text">From</span>
        <input v-model="fromVal" class="pc-num" type="number" placeholder="0" data-test-id="numberFrom">
        <span class="pc-text">to</span>
        <input v-model="toVal" class="pc-num" type="number" placeholder="0" data-test-id="numberTo">
        <span class="pc-eq">=</span>
        <div
          class="pc-result"
          :class="{ 'pc-result-active': changeResult, 'pc-result-positive': changeResult.startsWith('+'), 'pc-result-negative': changeResult.startsWith('-') }"
          data-test-id="percentageIncreaseDecrease"
          @click="copyResult('chg', changeResult)"
        >
          <span v-if="changeResult" class="pc-result-val">{{ changeResult }}</span>
          <span v-else class="pc-result-empty">Result</span>
          <span v-if="changeResult" class="pc-result-copy">
            <span v-if="copiedKey === 'chg'">✓</span>
            <icon-mdi-content-copy v-else />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-wrap {
  flex: 1 1 480px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pc-panel {
  display: flex;
  flex-direction: column;
}

.pc-panel-bar {
  /* padding inherits from .kt-terminal-bar global (6px 10px) */
}

.pc-body {
  padding: 12px 14px;
}

.pc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pc-text {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.pc-eq {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 1rem;
  color: rgba(30, 165, 76, 0.5);
}

/* ── Number input ── */
.pc-num {
  width: 110px;
  background: #121212;
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  padding: 6px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  transition: border-color 0.15s;
  appearance: textfield;
  -moz-appearance: textfield;
}

.pc-num::-webkit-inner-spin-button,
.pc-num::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.pc-num::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.pc-num:focus {
  border-color: rgba(30, 165, 76, 0.55);
}

/* ── Result box ── */
.pc-result {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(30, 165, 76, 0.12);
  border-radius: 5px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  transition: border-color 0.12s, background 0.12s;
}

.pc-result-active {
  border-color: rgba(30, 165, 76, 0.3);
  cursor: pointer;
}

.pc-result-active:hover {
  background: rgba(30, 165, 76, 0.06);
  border-color: rgba(30, 165, 76, 0.5);
}

.pc-result-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1ea54c;
  flex: 1;
}

.pc-result-positive .pc-result-val {
  color: #1ea54c;
}

.pc-result-negative .pc-result-val {
  color: #e05555;
}

.pc-result-empty {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.18);
}

.pc-result-copy {
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.4);
  flex-shrink: 0;
}

.pc-result-active:hover .pc-result-copy {
  color: rgba(30, 165, 76, 0.8);
}

/* ── Light mode ── */
/* Bar and title: beat the systemic [class*="-terminal"] * green via scoped [data-v] specificity boost */
html:not(.dark) .pc-panel-bar { color: rgba(0, 0, 0, 0.70) !important; }
html:not(.dark) .pc-panel-bar .kt-terminal-bar-title { color: rgba(0, 0, 0, 0.70) !important; }

html:not(.dark) .pc-text { color: rgba(0, 0, 0, 0.60); }

html:not(.dark) .pc-result {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(13, 112, 51, 0.15);
}

html:not(.dark) .pc-result-active { border-color: rgba(13, 112, 51, 0.30); }
html:not(.dark) .pc-result-active:hover { background: rgba(13, 112, 51, 0.06); border-color: rgba(13, 112, 51, 0.50); }

html:not(.dark) .pc-result-val { color: #0d7033; }
html:not(.dark) .pc-result-negative .pc-result-val { color: #b02020; }

html:not(.dark) .pc-result-empty { color: rgba(0, 0, 0, 0.25); }

html:not(.dark) .pc-result-copy { color: rgba(13, 112, 51, 0.40); }
html:not(.dark) .pc-result-active:hover .pc-result-copy { color: rgba(13, 112, 51, 0.75); }
</style>

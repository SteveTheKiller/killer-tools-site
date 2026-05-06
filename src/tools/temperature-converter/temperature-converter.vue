<script setup lang="ts">
import _ from 'lodash';
import {
  convertCelsiusToKelvin,
  convertDelisleToKelvin,
  convertFahrenheitToKelvin,
  convertKelvinToCelsius,
  convertKelvinToDelisle,
  convertKelvinToFahrenheit,
  convertKelvinToNewton,
  convertKelvinToRankine,
  convertKelvinToReaumur,
  convertKelvinToRomer,
  convertNewtonToKelvin,
  convertRankineToKelvin,
  convertReaumurToKelvin,
  convertRomerToKelvin,
} from './temperature-converter.models';

type TemperatureScale = 'kelvin' | 'celsius' | 'fahrenheit' | 'rankine' | 'delisle' | 'newton' | 'reaumur' | 'romer';

const units = reactive<
  Record<string | TemperatureScale, { title: string, unit: string, ref: number, toKelvin: (v: number) => number, fromKelvin: (v: number) => number }>
>({
  kelvin: { title: 'Kelvin', unit: 'K', ref: 0, toKelvin: _.identity, fromKelvin: _.identity },
  celsius: { title: 'Celsius', unit: '°C', ref: 0, toKelvin: convertCelsiusToKelvin, fromKelvin: convertKelvinToCelsius },
  fahrenheit: { title: 'Fahrenheit', unit: '°F', ref: 0, toKelvin: convertFahrenheitToKelvin, fromKelvin: convertKelvinToFahrenheit },
  rankine: { title: 'Rankine', unit: '°R', ref: 0, toKelvin: convertRankineToKelvin, fromKelvin: convertKelvinToRankine },
  delisle: { title: 'Delisle', unit: '°De', ref: 0, toKelvin: convertDelisleToKelvin, fromKelvin: convertKelvinToDelisle },
  newton: { title: 'Newton', unit: '°N', ref: 0, toKelvin: convertNewtonToKelvin, fromKelvin: convertKelvinToNewton },
  reaumur: { title: 'Réaumur', unit: '°Ré', ref: 0, toKelvin: convertReaumurToKelvin, fromKelvin: convertKelvinToReaumur },
  romer: { title: 'Rømer', unit: '°Rø', ref: 0, toKelvin: convertRomerToKelvin, fromKelvin: convertKelvinToRomer },
});

function update(key: TemperatureScale) {
  const { ref: value, toKelvin } = units[key];
  const kelvins = toKelvin(value) ?? 0;
  _.chain(units)
    .omit(key)
    .forEach(({ fromKelvin }, index) => {
      units[index].ref = Math.floor((fromKelvin(kelvins) ?? 0) * 100) / 100;
    })
    .value();
}

update('kelvin');
</script>

<template>
  <div class="tc-wrap">
    <div class="tc-terminal">
      <div
        v-for="[key, { title, unit }] in Object.entries(units)"
        :key="key"
        class="tc-row"
      >
        <span class="tc-prompt">&gt;_</span>
        <span class="tc-label">{{ title }}</span>
        <input
          v-model.number="units[key].ref"
          class="tc-input"
          type="number"
          spellcheck="false"
          @input="update(key as TemperatureScale)"
        >
        <span class="tc-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-wrap {
  flex: 1 1 420px;
  max-width: 720px;
}

.tc-terminal {
  background: #0a0a0c !important;
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.tc-row {
  display: grid;
  grid-template-columns: auto 120px 1fr 52px;
  align-items: center;
  border-bottom: 1px solid rgba(30, 165, 76, 0.07);
  transition: background 0.1s;
}

.tc-row:last-child {
  border-bottom: none;
}

.tc-row:focus-within {
  background: rgba(30, 165, 76, 0.04);
}

.tc-prompt {
  color: rgba(30, 165, 76, 0.5);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  padding: 0 8px 0 12px;
}

.tc-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.78rem;
  white-space: nowrap;
  padding: 9px 0;
}

.tc-input {
  background: transparent !important;
  border: none;
  border-left: 1px solid rgba(30, 165, 76, 0.08);
  border-right: 1px solid rgba(30, 165, 76, 0.08);
  outline: none;
  padding: 9px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.9rem;
  color: #1ea54c;
  width: 100%;
  box-sizing: border-box;
  -moz-appearance: textfield;
  appearance: textfield;
}

.tc-input::-webkit-inner-spin-button,
.tc-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.tc-unit {
  text-align: center;
  font-size: 0.72rem;
  color: rgba(30, 165, 76, 0.85);
  padding: 0 8px;
  white-space: nowrap;
}
</style>

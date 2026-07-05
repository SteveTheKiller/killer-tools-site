<script setup lang="ts">
import figlet from 'figlet';
import { useCopy } from '@/composable/copy';

const input = ref('Ascii ART');
const debouncedInput = refDebounced(input, 400);
const font = useStorage('ascii-text-drawer:font', 'Standard');
const width = useStorage('ascii-text-drawer:width', 80);
const output = ref('');
const errored = ref(false);
const processing = ref(false);
const { copy, isJustCopied: copied } = useCopy({ source: output });

figlet.defaults({ fontPath: '/figlet-fonts' });

watchEffect(async () => {
  processing.value = true;
  try {
    const options = { font: font.value as string, width: width.value, whitespaceBreak: true };
    output.value = await new Promise<string>((resolve, reject) =>
      figlet.text(debouncedInput.value, options, (err, text) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(text ?? '');
      }));
    errored.value = false;
  }
  catch {
    if (font.value !== 'Standard') {
      font.value = 'Standard';
    }
    else {
      errored.value = true;
    }
  }
  processing.value = false;
});

const fonts = ['1Row', '3-D', '3D Diagonal', '3D-ASCII', '3x5', '4Max', '5 Line Oblique', 'AMC 3 Line', 'AMC 3 Liv1', 'AMC AAA01', 'AMC Neko', 'AMC Razor', 'AMC Razor2', 'AMC Slash', 'AMC Slider', 'AMC Thin', 'AMC Tubes', 'AMC Untitled', 'ANSI Shadow', 'ASCII New Roman', 'Acrobatic', 'Alligator', 'Alligator2', 'Alpha', 'Alphabet', 'Arrows', 'Avatar', 'B1FF', 'Banner', 'Banner3-D', 'Banner3', 'Banner4', 'Barbwire', 'Basic', 'Bear', 'Bell', 'Benjamin', 'Big Chief', 'Big Money-ne', 'Big Money-nw', 'Big Money-se', 'Big Money-sw', 'Big', 'Bigfig', 'Binary', 'Block', 'Blocks', 'Bloody', 'Bolger', 'Braced', 'Bright', 'Broadway KB', 'Broadway', 'Bubble', 'Bulbhead', 'Caligraphy', 'Caligraphy2', 'Calvin S', 'Cards', 'Catwalk', 'Chiseled', 'Chunky', 'Coinstak', 'Cola', 'Colossal', 'Computer', 'Contessa', 'Contrast', 'Cosmike', 'Crawford', 'Crawford2', 'Crazy', 'Cricket', 'Cursive', 'Cyberlarge', 'Cybermedium', 'Cybersmall', 'Cygnet', 'DANC4', 'DOS Rebel', 'DWhistled', 'Dancing Font', 'Decimal', 'Def Leppard', 'Delta Corps Priest 1', 'Diamond', 'Diet Cola', 'Digital', 'Doh', 'Doom', 'Dot Matrix', 'Double Shorts', 'Double', 'Dr Pepper', 'Efti Chess', 'Efti Font', 'Efti Italic', 'Efti Piti', 'Efti Robot', 'Efti Wall', 'Efti Water', 'Electronic', 'Elite', 'Epic', 'Fender', 'Filter', 'Fire Font-k', 'Fire Font-s', 'Flipped', 'Flower Power', 'Four Tops', 'Fraktur', 'Fun Face', 'Fun Faces', 'Fuzzy', 'Georgi16', 'Georgia11', 'Ghost', 'Ghoulish', 'Glenyn', 'Goofy', 'Gothic', 'Graceful', 'Gradient', 'Graffiti', 'Greek', 'Heart Left', 'Heart Right', 'Henry 3D', 'Hex', 'Hieroglyphs', 'Hollywood', 'Horizontal Left', 'Horizontal Right', 'ICL-1900', 'Impossible', 'Invita', 'Isometric1', 'Isometric2', 'Isometric3', 'Isometric4', 'Italic', 'Ivrit', 'JS Block Letters', 'JS Bracket Letters', 'JS Capital Curves', 'JS Cursive', 'JS Stick Letters', 'Jacky', 'Jazmine', 'Jerusalem', 'Katakana', 'Kban', 'Keyboard', 'Knob', 'Konto Slant', 'Konto', 'LCD', 'Larry 3D 2', 'Larry 3D', 'Lean', 'Letters', 'Lil Devil', 'Line Blocks', 'Linux', 'Lockergnome', 'Madrid', 'Marquee', 'Maxfour', 'Merlin1', 'Merlin2', 'Mike', 'Mini', 'Mirror', 'Mnemonic', 'Modular', 'Morse', 'Morse2', 'Moscow', 'Mshebrew210', 'Muzzle', 'NScript', 'NT Greek', 'NV Script', 'Nancyj-Fancy', 'Nancyj-Improved', 'Nancyj-Underlined', 'Nancyj', 'Nipples', 'O8', 'OS2', 'Octal', 'Ogre', 'Old Banner', 'Patorjk\'s Cheese', 'Patorjk-HeX', 'Pawp', 'Peaks Slant', 'Peaks', 'Pebbles', 'Pepper', 'Poison', 'Puffy', 'Puzzle', 'Pyramid', 'Rammstein', 'Rectangles', 'Red Phoenix', 'Relief', 'Relief2', 'Reverse', 'Roman', 'Rot13', 'Rot13', 'Rotated', 'Rounded', 'Rowan Cap', 'Rozzo', 'Runic', 'Runyc', 'S Blood', 'SL Script', 'Santa Clara', 'Script', 'Serifcap', 'Shadow', 'Shimrod', 'Short', 'Slant Relief', 'Slant', 'Slide', 'Small Caps', 'Small Isometric1', 'Small Keyboard', 'Small Poison', 'Small Script', 'Small Shadow', 'Small Slant', 'Small Tengwar', 'Small', 'Soft', 'Speed', 'Spliff', 'Stacey', 'Stampate', 'Stampatello', 'Standard', 'Star Strips', 'Star Wars', 'Stellar', 'Stforek', 'Stick Letters', 'Stop', 'Straight', 'Stronger Than All', 'Sub-Zero', 'Swamp Land', 'Swan', 'Sweet', 'THIS', 'Tanja', 'Tengwar', 'Term', 'Test1', 'The Edge', 'Thick', 'Thin', 'Thorned', 'Three Point', 'Ticks Slant', 'Ticks', 'Tiles', 'Tinker-Toy', 'Tombstone', 'Train', 'Trek', 'Tsalagi', 'Tubular', 'Twisted', 'Two Point', 'USA Flag', 'Univers', 'Varsity', 'Wavy', 'Weird', 'Wet Letter', 'Whimsy', 'Wow'];

// Searchable font dropdown
const fontOpen = ref(false);
const fontSearch = ref('');
const fontSearchInput = ref<HTMLInputElement>();
const fontTriggerBtn = ref<HTMLButtonElement>();
const fontDropdownList = ref<HTMLElement>();
const focusedIndex = ref(-1);

const filteredFonts = computed(() =>
  fontSearch.value === ''
    ? fonts
    : fonts.filter(f => f.toLowerCase().includes(fontSearch.value.toLowerCase())),
);

watch(fontSearch, () => {
  focusedIndex.value = -1;
});

function openFontDropdown() {
  fontOpen.value = true;
  fontSearch.value = '';
  focusedIndex.value = filteredFonts.value.indexOf(font.value);
  nextTick(() => {
    fontSearchInput.value?.focus();
    scrollFocusedIntoView();
  });
}

function selectFont(f: string) {
  font.value = f;
  fontOpen.value = false;
  fontSearch.value = '';
  nextTick(() => fontTriggerBtn.value?.focus());
}

function onFontBlur(e: FocusEvent) {
  const rel = e.relatedTarget as HTMLElement | null;
  if (!rel?.closest?.('.aa-font-dropdown')) {
    fontOpen.value = false;
  }
}

function scrollFocusedIntoView() {
  nextTick(() => {
    const list = fontDropdownList.value;
    if (!list) {
      return;
    }
    const active = list.querySelector('.aa-dropdown-item-focused') as HTMLElement | null;
    active?.scrollIntoView({ block: 'nearest' });
  });
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (fontOpen.value) {
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const idx = fonts.indexOf(font.value);
    if (e.key === 'ArrowDown') {
      font.value = fonts[(idx + 1) % fonts.length];
    }
    else {
      font.value = fonts[(idx - 1 + fonts.length) % fonts.length];
    }
  }
}

function onTriggerWheel(e: WheelEvent) {
  if (fontOpen.value) {
    return;
  }
  e.preventDefault();
  const idx = fonts.indexOf(font.value);
  if (e.deltaY > 0) {
    font.value = fonts[(idx + 1) % fonts.length];
  }
  else {
    font.value = fonts[(idx - 1 + fonts.length) % fonts.length];
  }
}

function onSearchKeydown(e: KeyboardEvent) {
  if (!filteredFonts.value.length) {
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value + 1) % filteredFonts.value.length;
    scrollFocusedIntoView();
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value - 1 + filteredFonts.value.length) % filteredFonts.value.length;
    scrollFocusedIntoView();
  }
  else if (e.key === 'Enter' && focusedIndex.value >= 0) {
    e.preventDefault();
    selectFont(filteredFonts.value[focusedIndex.value]);
  }
}
</script>

<template>
  <div class="aa-wrap">
    <!-- LEFT: controls -->
    <div class="aa-left">
      <!-- Text input -->
      <div class="aa-input-card kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">YOUR TEXT</span>
        </div>
        <div class="aa-input-area">
          <textarea
            v-model="input"
            class="aa-textarea"
            placeholder="Your text to draw"
            rows="6"
            spellcheck="false"
            autofocus
          />
        </div>
      </div>

      <!-- Controls -->
      <div class="aa-controls kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">OPTIONS</span>
        </div>
        <div class="aa-controls-body">
          <!-- Font searchable dropdown -->
          <div class="aa-field aa-field-grow">
            <span class="aa-label">FONT</span>
            <div class="aa-font-dropdown" tabindex="0" @blur="onFontBlur($event)">
              <button ref="fontTriggerBtn" type="button" class="aa-dropdown-trigger" @click="openFontDropdown()" @keydown="onTriggerKeydown" @wheel.prevent="onTriggerWheel">
                <span>{{ font }}</span>
                <icon-mdi-chevron-down class="aa-chevron" :class="{ 'aa-chevron-open': fontOpen }" />
              </button>
              <div v-if="fontOpen" class="aa-dropdown-menu">
                <div class="aa-search-wrap">
                  <icon-mdi-magnify class="aa-search-icon" />
                  <input
                    ref="fontSearchInput"
                    v-model="fontSearch"
                    class="aa-search-input"
                    placeholder="Search fonts..."
                    type="text"
                    spellcheck="false"
                    @keydown="onSearchKeydown"
                  >
                </div>
                <div ref="fontDropdownList" class="aa-dropdown-list">
                  <button
                    v-for="(f, i) in filteredFonts" :key="f" type="button"
                    class="aa-dropdown-item"
                    :class="{ 'aa-dropdown-item-active': f === font, 'aa-dropdown-item-focused': i === focusedIndex }"
                    @click="selectFont(f)"
                  >
                    {{ f }}
                  </button>
                  <div v-if="filteredFonts.length === 0" class="aa-no-results">
                    No fonts match
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Width stepper -->
          <div class="aa-field">
            <span class="aa-label">WIDTH</span>
            <div class="aa-stepper">
              <button class="aa-step-btn" :disabled="width <= 0" @click="width = Math.max(0, width - 5)">
                −
              </button>
              <input v-model.number="width" class="aa-step-input" type="number" min="0" max="10000">
              <button class="aa-step-btn" @click="width = Math.min(10000, width + 5)">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: output -->
    <div class="aa-right">
      <!-- Loading -->
      <div v-if="processing" class="aa-output-wrap kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">ASCII ART OUTPUT</span>
        </div>
        <div class="aa-loading">
          <span class="aa-loading-dot" />
          Loading font...
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errored" class="aa-output-wrap kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">ASCII ART OUTPUT</span>
        </div>
        <div class="aa-error">
          <icon-mdi-alert-circle />
          Current settings resulted in an error.
        </div>
      </div>

      <!-- Output -->
      <div v-else class="aa-output-wrap kt-terminal">
        <div class="kt-terminal-bar">
          <span class="kt-terminal-bar-title">ASCII ART OUTPUT</span>
          <button class="aa-copy-btn" @click="copy()">
            <icon-mdi-check v-if="copied" />
            <icon-mdi-content-copy v-else />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="aa-pre-scroll">
          <pre class="aa-pre">{{ output }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 2-column layout ── */
.aa-wrap {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 14px;
  width: 100%;
  align-items: start;
}

@media (max-width: 860px) {
  .aa-wrap {
    grid-template-columns: 1fr;
  }
}

.aa-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.aa-right {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ── Input card ── */
.aa-input-card {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.aa-input-area {
  padding: 10px 12px;
}

.aa-textarea {
  width: 100%;
  box-sizing: border-box;
  background: transparent !important;
  border: none;
  outline: none;
  padding: 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.85);
  resize: none;
  line-height: 1.6;
}

.aa-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

/* ── Controls card ── */
.aa-controls {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

.aa-controls-body {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 12px;
}

/* ── Field ── */
.aa-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aa-field-grow { flex: 1; min-width: 0; }

.aa-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Controls card: allow dropdown to escape the card boundary ── */
/* kt-terminal sets overflow: hidden for rounded corners — that clips the
   absolutely-positioned font menu. Override for this specific card only. */
.aa-controls {
  overflow: visible !important;
}

/* Re-apply overflow: hidden only to the terminal bar so its border-radius
   still clips correctly at the top of the card */
.aa-controls .kt-terminal-bar {
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

/* ── Font dropdown ── */
.aa-font-dropdown { position: relative; outline: none; }

.aa-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: #1a1a1a;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
}

.aa-dropdown-trigger:hover,
.aa-font-dropdown:focus-within .aa-dropdown-trigger {
  border-color: rgba(var(--kt-accent-rgb), 0.55);
}

.aa-chevron {
  margin-left: auto;
  color: rgba(var(--kt-accent-rgb), 0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.aa-chevron-open { transform: rotate(180deg); }

.aa-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  min-width: 240px;
  background: #121212;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

.aa-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.25);
  background: rgba(var(--kt-accent-rgb), 0.08);
}

.aa-search-icon { color: rgba(var(--kt-accent-rgb), 0.4); flex-shrink: 0; }

.aa-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

.aa-search-input::placeholder { color: rgba(255, 255, 255, 0.2); }

.aa-dropdown-list {
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--kt-accent-rgb), 0.3) transparent;
}

.aa-dropdown-item {
  display: block;
  width: 100%;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--kt-accent-rgb), 0.04);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.aa-dropdown-item:last-child { border-bottom: none; }
.aa-dropdown-item:hover { background: rgba(var(--kt-accent-rgb), 0.1); color: #fff; }
.aa-dropdown-item-active { color: var(--kt-accent); background: rgba(var(--kt-accent-rgb), 0.08); }
.aa-dropdown-item-focused { background: rgba(var(--kt-accent-rgb), 0.15); color: #fff; outline: none; }

.aa-no-results {
  padding: 12px 14px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

/* ── Width stepper ── */
.aa-stepper {
  display: inline-flex;
  align-items: center;
  background: #1a1a1a;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.2);
  border-radius: 5px;
  overflow: hidden;
  height: 32px;
}

.aa-step-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(var(--kt-accent-rgb), 0.12);
  color: var(--kt-accent);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.aa-step-btn:last-child { border-right: none; border-left: 1px solid rgba(var(--kt-accent-rgb), 0.12); }
.aa-step-btn:hover:not(:disabled) { background: rgba(var(--kt-accent-rgb), 0.1); }
.aa-step-btn:disabled { opacity: 0.3; cursor: default; }

.aa-step-input {
  width: 56px;
  background: transparent;
  border: none;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: var(--kt-accent);
  outline: none;
  appearance: textfield;
  -moz-appearance: textfield;
}

.aa-step-input::-webkit-inner-spin-button,
.aa-step-input::-webkit-outer-spin-button { -webkit-appearance: none; }

/* ── Output card ── */
.aa-output-wrap {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  height: 100%;
}

.aa-copy-btn {
  margin-left: auto;
}

.aa-pre-scroll {
  overflow-x: auto;
}

.aa-pre {
  margin: 0;
  padding: 14px 16px;
  background: transparent;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: var(--kt-accent);
  white-space: pre;
  line-height: 1.4;
  min-width: max-content;
}

/* ── Loading / Error ── */
.aa-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.aa-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--kt-accent);
  animation: aa-pulse 1s ease-in-out infinite;
}

@keyframes aa-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.aa-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: #e05555;
}

/* ── Copy button ── */
.aa-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.35);
  background: rgba(var(--kt-accent-rgb), 0.08);
  color: rgba(var(--kt-accent-rgb), 0.8);
  font-size: 0.67rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.aa-copy-btn:hover {
  background: rgba(var(--kt-accent-rgb), 0.18);
  border-color: var(--kt-accent);
  color: var(--kt-accent);
}

/* ── Light mode ── */
html:not(.dark) .aa-copy-btn { background: rgba(13, 112, 51, 0.08); border-color: rgba(13, 112, 51, 0.30); color: #0b5c28; }
html:not(.dark) .aa-copy-btn:hover { background: rgba(13, 112, 51, 0.15); border-color: #0d7033; color: #083d1a; }

html:not(.dark) .aa-pre { color: rgba(0, 0, 0, 0.82); }
</style>

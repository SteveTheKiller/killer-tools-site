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
const { copy, copied } = useCopy({ source: output });

figlet.defaults({ fontPath: '/figlet-fonts' });

watchEffect(async () => {
  processing.value = true;
  try {
    const options = { font: font.value as string, width: width.value, whitespaceBreak: true };
    output.value = await new Promise<string>((resolve, reject) =>
      figlet.text(debouncedInput.value, options, (err, text) => {
        if (err) { reject(err); return; }
        resolve(text ?? '');
      }));
    errored.value = false;
  }
  catch {
    if (font.value !== 'Standard') font.value = 'Standard';
    else errored.value = true;
  }
  processing.value = false;
});

const fonts = ['1Row', '3-D', '3D Diagonal', '3D-ASCII', '3x5', '4Max', '5 Line Oblique', 'AMC 3 Line', 'AMC 3 Liv1', 'AMC AAA01', 'AMC Neko', 'AMC Razor', 'AMC Razor2', 'AMC Slash', 'AMC Slider', 'AMC Thin', 'AMC Tubes', 'AMC Untitled', 'ANSI Shadow', 'ASCII New Roman', 'Acrobatic', 'Alligator', 'Alligator2', 'Alpha', 'Alphabet', 'Arrows', 'Avatar', 'B1FF', 'Banner', 'Banner3-D', 'Banner3', 'Banner4', 'Barbwire', 'Basic', 'Bear', 'Bell', 'Benjamin', 'Big Chief', 'Big Money-ne', 'Big Money-nw', 'Big Money-se', 'Big Money-sw', 'Big', 'Bigfig', 'Binary', 'Block', 'Blocks', 'Bloody', 'Bolger', 'Braced', 'Bright', 'Broadway KB', 'Broadway', 'Bubble', 'Bulbhead', 'Caligraphy', 'Caligraphy2', 'Calvin S', 'Cards', 'Catwalk', 'Chiseled', 'Chunky', 'Coinstak', 'Cola', 'Colossal', 'Computer', 'Contessa', 'Contrast', 'Cosmike', 'Crawford', 'Crawford2', 'Crazy', 'Cricket', 'Cursive', 'Cyberlarge', 'Cybermedium', 'Cybersmall', 'Cygnet', 'DANC4', 'DOS Rebel', 'DWhistled', 'Dancing Font', 'Decimal', 'Def Leppard', 'Delta Corps Priest 1', 'Diamond', 'Diet Cola', 'Digital', 'Doh', 'Doom', 'Dot Matrix', 'Double Shorts', 'Double', 'Dr Pepper', 'Efti Chess', 'Efti Font', 'Efti Italic', 'Efti Piti', 'Efti Robot', 'Efti Wall', 'Efti Water', 'Electronic', 'Elite', 'Epic', 'Fender', 'Filter', 'Fire Font-k', 'Fire Font-s', 'Flipped', 'Flower Power', 'Four Tops', 'Fraktur', 'Fun Face', 'Fun Faces', 'Fuzzy', 'Georgi16', 'Georgia11', 'Ghost', 'Ghoulish', 'Glenyn', 'Goofy', 'Gothic', 'Graceful', 'Gradient', 'Graffiti', 'Greek', 'Heart Left', 'Heart Right', 'Henry 3D', 'Hex', 'Hieroglyphs', 'Hollywood', 'Horizontal Left', 'Horizontal Right', 'ICL-1900', 'Impossible', 'Invita', 'Isometric1', 'Isometric2', 'Isometric3', 'Isometric4', 'Italic', 'Ivrit', 'JS Block Letters', 'JS Bracket Letters', 'JS Capital Curves', 'JS Cursive', 'JS Stick Letters', 'Jacky', 'Jazmine', 'Jerusalem', 'Katakana', 'Kban', 'Keyboard', 'Knob', 'Konto Slant', 'Konto', 'LCD', 'Larry 3D 2', 'Larry 3D', 'Lean', 'Letters', 'Lil Devil', 'Line Blocks', 'Linux', 'Lockergnome', 'Madrid', 'Marquee', 'Maxfour', 'Merlin1', 'Merlin2', 'Mike', 'Mini', 'Mirror', 'Mnemonic', 'Modular', 'Morse', 'Morse2', 'Moscow', 'Mshebrew210', 'Muzzle', 'NScript', 'NT Greek', 'NV Script', 'Nancyj-Fancy', 'Nancyj-Improved', 'Nancyj-Underlined', 'Nancyj', 'Nipples', 'O8', 'OS2', 'Octal', 'Ogre', 'Old Banner', 'Patorjk\'s Cheese', 'Patorjk-HeX', 'Pawp', 'Peaks Slant', 'Peaks', 'Pebbles', 'Pepper', 'Poison', 'Puffy', 'Puzzle', 'Pyramid', 'Rammstein', 'Rectangles', 'Red Phoenix', 'Relief', 'Relief2', 'Reverse', 'Roman', 'Rot13', 'Rot13', 'Rotated', 'Rounded', 'Rowan Cap', 'Rozzo', 'Runic', 'Runyc', 'S Blood', 'SL Script', 'Santa Clara', 'Script', 'Serifcap', 'Shadow', 'Shimrod', 'Short', 'Slant Relief', 'Slant', 'Slide', 'Small Caps', 'Small Isometric1', 'Small Keyboard', 'Small Poison', 'Small Script', 'Small Shadow', 'Small Slant', 'Small Tengwar', 'Small', 'Soft', 'Speed', 'Spliff', 'Stacey', 'Stampate', 'Stampatello', 'Standard', 'Star Strips', 'Star Wars', 'Stellar', 'Stforek', 'Stick Letters', 'Stop', 'Straight', 'Stronger Than All', 'Sub-Zero', 'Swamp Land', 'Swan', 'Sweet', 'THIS', 'Tanja', 'Tengwar', 'Term', 'Test1', 'The Edge', 'Thick', 'Thin', 'Thorned', 'Three Point', 'Ticks Slant', 'Ticks', 'Tiles', 'Tinker-Toy', 'Tombstone', 'Train', 'Trek', 'Tsalagi', 'Tubular', 'Twisted', 'Two Point', 'USA Flag', 'Univers', 'Varsity', 'Wavy', 'Weird', 'Wet Letter', 'Whimsy', 'Wow'];

// Searchable font dropdown
const fontOpen = ref(false);
const fontSearch = ref('');
const fontSearchInput = ref<HTMLInputElement>();

const filteredFonts = computed(() =>
  fontSearch.value === ''
    ? fonts
    : fonts.filter(f => f.toLowerCase().includes(fontSearch.value.toLowerCase())),
);

function openFontDropdown() {
  fontOpen.value = true;
  fontSearch.value = '';
  nextTick(() => fontSearchInput.value?.focus());
}

function selectFont(f: string) {
  font.value = f;
  fontOpen.value = false;
  fontSearch.value = '';
}

function onFontBlur(e: FocusEvent) {
  const rel = e.relatedTarget as HTMLElement | null;
  if (!rel?.closest?.('.aa-font-dropdown')) fontOpen.value = false;
}
</script>

<template>
  <div class="aa-wrap">
    <!-- Text input -->
    <div class="aa-field">
      <span class="aa-label">YOUR TEXT</span>
      <textarea
        class="aa-textarea"
        v-model="input"
        placeholder="Your text to draw"
        rows="4"
        spellcheck="false"
      />
    </div>

    <!-- Controls row -->
    <div class="aa-controls">
      <!-- Font searchable dropdown -->
      <div class="aa-field aa-field-grow">
        <span class="aa-label">FONT</span>
        <div class="aa-font-dropdown" tabindex="0" @blur="onFontBlur($event)">
          <button type="button" class="aa-dropdown-trigger" @click="openFontDropdown()">
            <span>{{ font }}</span>
            <icon-mdi-chevron-down class="aa-chevron" :class="{ 'aa-chevron-open': fontOpen }" />
          </button>
          <div v-if="fontOpen" class="aa-dropdown-menu">
            <div class="aa-search-wrap">
              <icon-mdi-magnify class="aa-search-icon" />
              <input
                ref="fontSearchInput"
                class="aa-search-input"
                v-model="fontSearch"
                placeholder="Search fonts..."
                type="text"
                spellcheck="false"
              />
            </div>
            <div class="aa-dropdown-list">
              <button
                v-for="f in filteredFonts" :key="f" type="button"
                class="aa-dropdown-item" :class="{ 'aa-dropdown-item-active': f === font }"
                @click="selectFont(f)"
              >{{ f }}</button>
              <div v-if="filteredFonts.length === 0" class="aa-no-results">No fonts match</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Width stepper -->
      <div class="aa-field">
        <span class="aa-label">WIDTH</span>
        <div class="aa-stepper">
          <button class="aa-step-btn" :disabled="width <= 0" @click="width = Math.max(0, width - 5)">−</button>
          <input class="aa-step-input" type="number" v-model.number="width" min="0" max="10000" />
          <button class="aa-step-btn" @click="width = Math.min(10000, width + 5)">+</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="processing" class="aa-loading">
      <span class="aa-loading-dot" />
      Loading font...
    </div>

    <!-- Error -->
    <div v-else-if="errored" class="aa-error">
      <icon-mdi-alert-circle />
      Current settings resulted in an error.
    </div>

    <!-- Output -->
    <div v-else class="aa-output-block">
      <div class="aa-output-header">
        <span class="aa-label">ASCII ART OUTPUT</span>
        <button class="aa-copy-btn" @click="copy()">
          <icon-mdi-check v-if="copied" />
          <icon-mdi-content-copy v-else />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <pre class="aa-pre">{{ output }}</pre>
    </div>
  </div>
</template>

<style scoped>
.aa-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  width: 100%;
}

/* Labels */
.aa-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* Field */
.aa-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aa-field-grow { flex: 1; }

/* Controls row */
.aa-controls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

/* Textarea */
.aa-textarea {
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.aa-textarea:focus { border-color: rgba(30, 165, 76, 0.5); }
.aa-textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

/* Font dropdown */
.aa-font-dropdown { position: relative; outline: none; }

.aa-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.2);
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
  border-color: rgba(30, 165, 76, 0.55);
}

.aa-chevron {
  margin-left: auto;
  color: rgba(30, 165, 76, 0.5);
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
  background: rgba(10, 10, 10, 0.97);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

/* Search bar inside dropdown */
.aa-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(30, 165, 76, 0.15);
  background: rgba(30, 165, 76, 0.04);
}

.aa-search-icon {
  color: rgba(30, 165, 76, 0.4);
  flex-shrink: 0;
}

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
  scrollbar-color: rgba(30, 165, 76, 0.3) transparent;
}

.aa-dropdown-item {
  display: block;
  width: 100%;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(30, 165, 76, 0.04);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.aa-dropdown-item:last-child { border-bottom: none; }
.aa-dropdown-item:hover { background: rgba(30, 165, 76, 0.1); color: #fff; }
.aa-dropdown-item-active { color: #1ea54c; background: rgba(30, 165, 76, 0.08); }

.aa-no-results {
  padding: 12px 14px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Width stepper */
.aa-stepper {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.2);
  border-radius: 5px;
  overflow: hidden;
  height: 32px;
}

.aa-step-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(30, 165, 76, 0.12);
  color: #1ea54c;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
  flex-shrink: 0;
}

.aa-step-btn:last-child {
  border-right: none;
  border-left: 1px solid rgba(30, 165, 76, 0.12);
}

.aa-step-btn:hover:not(:disabled) { background: rgba(30, 165, 76, 0.1); }
.aa-step-btn:disabled { opacity: 0.3; cursor: default; }

.aa-step-input {
  width: 56px;
  background: transparent;
  border: none;
  text-align: center;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  color: #1ea54c;
  outline: none;
  -moz-appearance: textfield;
}

.aa-step-input::-webkit-inner-spin-button,
.aa-step-input::-webkit-outer-spin-button { -webkit-appearance: none; }

/* Loading */
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
  background: #1ea54c;
  animation: aa-pulse 1s ease-in-out infinite;
}

@keyframes aa-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* Error */
.aa-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(200, 50, 50, 0.1);
  border: 1px solid rgba(200, 50, 50, 0.3);
  border-radius: 5px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: #e05555;
}

/* Output */
.aa-output-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aa-output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aa-pre {
  margin: 0;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  color: #1ea54c;
  white-space: pre;
  line-height: 1.4;
  min-width: max-content;
}

.aa-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(30, 165, 76, 0.3);
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.aa-copy-btn:hover {
  background: rgba(30, 165, 76, 0.1);
  border-color: rgba(30, 165, 76, 0.5);
  color: #1ea54c;
}
</style>

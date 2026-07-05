<script setup lang="ts">
// Family dropdown (grunge chrome). Replaces n-select where NaiveUI's
// body-appended follower misbehaved: this renders inline, wheel over the
// CLOSED control steps the selection, wheel over the OPEN list scrolls it,
// and there are no native title tooltips to cut across the menu.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

interface KtOption { label: string; value: string | number; disabled?: boolean }
interface KtGroup { type: 'group'; label: string; key?: string; children: KtOption[] }
type KtItem = KtOption | KtGroup;

const props = defineProps<{
  options: KtItem[]
  value: string | number | null
}>();

const emit = defineEmits<{ (e: 'update:value', v: string | number): void }>();

const open = ref(false);
const root = ref<HTMLElement>();
const listEl = ref<HTMLElement>();

function isGroup(i: KtItem): i is KtGroup {
  return (i as KtGroup).type === 'group';
}

// Flat selectable options in display order (wheel/arrow stepping order)
const flat = computed<KtOption[]>(() =>
  props.options
    .flatMap(i => (isGroup(i) ? i.children : [i as KtOption]))
    .filter(o => !o.disabled),
);

const selectedIndex = computed(() => flat.value.findIndex(o => o.value === props.value));
const selectedLabel = computed(() => flat.value[selectedIndex.value]?.label ?? '');

function choose(o: KtOption) {
  emit('update:value', o.value);
  open.value = false;
}

function step(dir: 1 | -1) {
  if (!flat.value.length) {
    return;
  }
  const from = selectedIndex.value === -1 ? 0 : selectedIndex.value + dir;
  const next = Math.min(flat.value.length - 1, Math.max(0, from));
  if (next !== selectedIndex.value) {
    emit('update:value', flat.value[next].value);
  }
}

// The menu teleports to <body> so panel overflow can never clip it; it is
// positioned fixed off the trigger rect and repositioned on scroll/resize.
const menuStyle = ref<Record<string, string>>({});

function reposition() {
  const t = root.value?.querySelector('.kts-input') as HTMLElement | null;
  if (!t) {
    return;
  }
  const r = t.getBoundingClientRect();
  const spaceBelow = window.innerHeight - r.bottom - 12;
  const openUp = spaceBelow < 180 && r.top > spaceBelow;
  menuStyle.value = {
    position: 'fixed',
    left: `${r.left}px`,
    width: `${r.width}px`,
    zIndex: '2000',
    ...(openUp
      ? { bottom: `${window.innerHeight - r.top + 4}px` }
      : { top: `${r.bottom + 4}px` }),
    maxHeight: `${Math.max(140, Math.min(280, (openUp ? r.top : spaceBelow) - 4))}px`,
  };
}

watch(open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
  }
  else {
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition);
  }
});

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    reposition();
    await nextTick();
    reposition();
    const sel = listEl.value?.querySelector('.kts-opt-selected') as HTMLElement | null;
    sel?.scrollIntoView({ block: 'nearest' });
  }
}

function onWheel(e: WheelEvent) {
  if (open.value) {
    // Steer the wheel into the list, even when the cursor is on the trigger
    if (listEl.value) {
      listEl.value.scrollTop += e.deltaY;
      e.preventDefault();
    }
    return;
  }
  e.preventDefault();
  step(e.deltaY > 0 ? 1 : -1);
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggle();
  }
  else if (e.key === 'Escape') {
    open.value = false;
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault();
    step(1);
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    step(-1);
  }
}

function onDocPointer(e: PointerEvent) {
  const t = e.target as Node;
  if (root.value?.contains(t) || listEl.value?.contains(t)) {
    return;
  }
  open.value = false;
}

onMounted(() => document.addEventListener('pointerdown', onDocPointer, true));
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer, true);
  window.removeEventListener('scroll', reposition, true);
  window.removeEventListener('resize', reposition);
});
</script>

<template>
  <div ref="root" class="kt-select" :class="{ 'kt-select-open': open }" @wheel="onWheel">
    <button
      type="button"
      class="kts-input"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown="onKey"
    >
      <span class="kts-label">{{ selectedLabel || '—' }}</span>
      <span class="kts-chevron" aria-hidden="true">▾</span>
    </button>
    <Teleport to="body">
      <div v-if="open" ref="listEl" class="kts-dropdown-menu" :style="menuStyle" role="listbox">
      <template v-for="(item, gi) in options" :key="isGroup(item) ? (item.key ?? `g${gi}`) : (item as any).value">
        <template v-if="isGroup(item)">
          <div class="kts-group">{{ item.label }}</div>
          <button
            v-for="o in item.children"
            :key="o.value"
            type="button"
            class="kts-opt"
            :class="{ 'kts-opt-selected': o.value === value }"
            role="option"
            :aria-selected="o.value === value"
            :disabled="o.disabled"
            @click="choose(o)"
          >
            <span class="kts-opt-label">{{ o.label }}</span>
            <span v-if="o.value === value" class="kts-check">✓</span>
          </button>
        </template>
        <button
          v-else
          type="button"
          class="kts-opt"
          :class="{ 'kts-opt-selected': (item as any).value === value }"
          role="option"
          :aria-selected="(item as any).value === value"
          :disabled="(item as any).disabled"
          @click="choose(item as any)"
        >
          <span class="kts-opt-label">{{ (item as any).label }}</span>
          <span v-if="(item as any).value === value" class="kts-check">✓</span>
        </button>
      </template>
      </div>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.kt-select {
  position: relative;
  width: 100%;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* Trigger — named "-input" so the site-wide black-theme field overrides
   in kt-terminal.css pick it up like every other themed input */
.kts-input {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  background: #1a1a1a;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.25);
  border-radius: 6px;
  padding: 7px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba(var(--kt-accent-rgb), 0.55);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--kt-accent);
  }
}

.kt-select-open .kts-input {
  border-color: var(--kt-accent);
}

.kts-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kts-chevron {
  flex: 0 0 auto;
  color: rgba(var(--kt-accent-rgb), 0.8);
  font-size: 0.7rem;
  transition: transform 0.15s;
}

.kt-select-open .kts-chevron {
  transform: rotate(180deg);
}

/* Menu — teleported to body (fixed, positioned off the trigger rect) so it
   paints ON TOP of everything and no panel overflow can clip it */
.kts-dropdown-menu {
  /* teleported out of .kt-select — no inherited font */
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  max-height: 280px;
  overflow-y: auto;
  overscroll-behavior: contain;
  box-sizing: border-box;
  padding: 4px;
  background: var(--kt-modal, #141414) var(--kt-grain-img, url('/grain-a12.png')) repeat;
  background-size: 256px 256px;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.45);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--kt-accent-rgb), 0.35) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--kt-accent-rgb), 0.35);
    border-radius: 4px;

    &:hover {
      background: rgba(var(--kt-accent-rgb), 0.6);
    }
  }
}

.kts-group {
  padding: 8px 10px 4px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
}

.kts-opt {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(var(--kt-accent-rgb), 0.14);
    color: #fff;
  }
}

.kts-opt-selected {
  background: rgba(var(--kt-accent-rgb), 0.18);
  color: var(--kt-accent);

  &:hover {
    background: rgba(var(--kt-accent-rgb), 0.24);
    color: var(--kt-accent);
  }
}

.kts-opt-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kts-check {
  flex: 0 0 auto;
  color: var(--kt-accent);
}

/* ── Light mode ── */
html:not(.dark) .kts-input {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.8);
}

html:not(.dark) .kts-dropdown-menu {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

html:not(.dark) .kts-group {
  color: rgba(0, 0, 0, 0.45);
}

html:not(.dark) .kts-opt {
  color: rgba(0, 0, 0, 0.75);
}

html:not(.dark) .kts-opt:hover {
  color: #000;
}
</style>

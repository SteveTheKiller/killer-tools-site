<script setup lang="ts">
import type { PaletteOption } from './command-palette.types';
import _ from 'lodash';
import { storeToRefs } from 'pinia';
import { useStyleStore } from '@/stores/style.store';
import { useCommandPaletteStore } from './command-palette.store';

const styleStore = useStyleStore();
const isModalOpen = ref(false);
const inputRef = ref();
const router = useRouter();
const isMac = computed(() => window.navigator.userAgent.toLowerCase().includes('mac'));

const commandPaletteStore = useCommandPaletteStore();
const { searchPrompt, filteredSearchResult } = storeToRefs(commandPaletteStore);

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }

    if (e.metaKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }
  },
});

whenever(isModalOpen, () => nextTick(() => setTimeout(() => inputRef.value?.focus(), 100)));

whenever(keys.ctrl_k, open);
whenever(keys.meta_k, open);
whenever(keys.escape, close);

function open() {
  return isModalOpen.value = true;
}

function close() {
  isModalOpen.value = false;
  searchPrompt.value = '';
}

const selectedOptionIndex = ref(-1);

function handleKeydown(event: KeyboardEvent) {
  const { key } = event;
  const isEnterPressed = key === 'Enter';
  const isArrowUpOrDown = ['ArrowUp', 'ArrowDown'].includes(key);
  const isArrowDown = key === 'ArrowDown';

  if (isArrowUpOrDown) {
    const increment = isArrowDown ? 1 : -1;
    const maxIndex = Math.max(_.chain(filteredSearchResult.value).values().flatten().size().value() - 1, 0);

    selectedOptionIndex.value = Math.min(Math.max(selectedOptionIndex.value + increment, 0), maxIndex);

    return;
  }

  if (isEnterPressed && selectedOptionIndex.value >= 0) {
    const option = _.chain(filteredSearchResult.value)
      .values()
      .flatten()
      .nth(selectedOptionIndex.value)
      .value();

    activateOption(option);
  }
}

function getOptionIndex(option: PaletteOption) {
  return _.chain(filteredSearchResult.value)
    .values()
    .flatten()
    .findIndex(o => o === option)
    .value();
}

function activateOption(option: PaletteOption) {
  const { closeOnSelect } = option;

  if (option.action) {
    option.action();

    if (closeOnSelect) {
      close();
    }

    return;
  }

  const closeAfterNavigation = closeOnSelect || _.isUndefined(closeOnSelect);

  if (option.to) {
    router.push(option.to);

    if (closeAfterNavigation) {
      close();
    }
    return;
  }

  if (option.href) {
    window.open(option.href, '_blank');

    if (closeAfterNavigation) {
      close();
    }
  }
}
</script>

<template>
  <div flex-1 class="palette-root">
    <!-- Desktop: the full search bar -->
    <c-button
      v-if="!styleStore.isSmallScreen"
      class="palette-btn"
      w-full important:justify-start
      @click="isModalOpen = true"
    >
      <span flex items-center gap-3 op-40>

        <icon-mdi-search />
        {{ $t('search.label') }}

        <span hidden flex-1 border border-current border-op-40 rounded border-solid px-5px py-3px sm:inline>
          {{ isMac ? 'Cmd' : 'Ctrl' }}&nbsp;+&nbsp;K
        </span>
      </span>
    </c-button>

    <!-- Mobile: bare white icon with the family drop shadow -->
    <button v-else type="button" class="search-icon-btn" aria-label="Search" @click="isModalOpen = true">
      <icon-mdi-search />
    </button>

    <c-modal v-model:open="isModalOpen" class="palette-modal" shadow-xl important:max-w-650px important:pa-12px @keydown="handleKeydown">
      <c-input-text ref="inputRef" v-model:value="searchPrompt" raw-text placeholder="Type to search a tool or a command..." autofocus clearable />

      <div v-for="(options, category) in filteredSearchResult" :key="category">
        <div ml-3 mt-3 text-sm text-primary font-bold op-60>
          {{ category }}
        </div>
        <command-palette-option v-for="option in options" :key="option.name" :option="option" :selected="selectedOptionIndex === getOptionIndex(option)" @activated="activateOption" />
      </div>
    </c-modal>
  </div>
</template>

<style scoped lang="less">
/* Mobile search trigger: bare white icon, family drop shadow, no chrome */
/* Root centers its child vertically — without this the icon-mode button
   pins to the top of the stretched wrapper instead of the row centerline */
.palette-root {
  display: flex;
  align-items: center;
}

.search-icon-btn {
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.92);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.65)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
  transition: color 0.12s;

  &:hover {
    color: var(--kt-accent);
  }
}

html:not(.dark) .search-icon-btn {
  color: #1a1a1a;
  filter: none;

  &:hover {
    color: var(--kt-accent);
  }
}

.c-input-text {
  font-size: 18px;

  ::v-deep(.input-wrapper) {
      padding: 4px;
      padding-left: 18px;
  }
}

.c-modal--overlay {
  align-items: flex-start !important;
  padding-top: 80px;
}
</style>

<style lang="less">
/* Family menu chrome for the palette box: grained modal surface, accent
   border, rounded corners, drop shadow (the dropdown-menu rule) */
.palette-modal.c-modal--container {
  background: var(--kt-modal, #111111) var(--kt-grain-img, url('/grain-a12.png')) repeat !important;
  background-size: 256px 256px !important;
  border: 1px solid rgba(var(--kt-accent-rgb), 0.45);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}
</style>

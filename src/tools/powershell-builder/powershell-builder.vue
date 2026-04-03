<script setup lang="ts">
import { type PSCmdlet, type PSParameter, categories, cmdlets } from './powershell-builder.data';

const selectedCmdletName = ref<string | null>(null);
const selectedCmdlet = ref<PSCmdlet | null>(null);
const cmdletSearch = ref('');
const categoryFilter = ref('All');

const filteredCmdlets = computed(() => {
  let list = cmdlets;
  if (categoryFilter.value !== 'All') {
    list = list.filter(c => c.category === categoryFilter.value);
  }
  const q = cmdletSearch.value.toLowerCase().trim();
  if (q) {
    list = list.filter(
      c =>
        c.cmdlet.toLowerCase().includes(q)
        || c.description.toLowerCase().includes(q)
        || c.module.toLowerCase().includes(q),
    );
  }
  return list;
});
const textValues = ref<Record<string, string>>({});
const switchValues = ref<Record<string, boolean>>({});
const showAllParams = ref(false);
const copied = ref(false);
const showCheatsheet = ref(true);
const snippetCopied = ref<string | null>(null);

function selectCmdlet(cmdlet: PSCmdlet) {
  selectedCmdlet.value = cmdlet;
  showAllParams.value = false;
  textValues.value = {};
  switchValues.value = {};
  for (const p of cmdlet.parameters) {
    if (p.type === 'switch') {
      switchValues.value[p.name] = false;
    }
    else {
      textValues.value[p.name] = '';
    }
  }
}

const visibleParams = computed(() => {
  if (!selectedCmdlet.value) {
    return [];
  }
  return showAllParams.value
    ? selectedCmdlet.value.parameters
    : selectedCmdlet.value.parameters.filter((p: PSParameter) => p.common);
});

const hiddenParamCount = computed(() => {
  if (!selectedCmdlet.value) {
    return 0;
  }
  return selectedCmdlet.value.parameters.filter((p: PSParameter) => !p.common).length;
});

function quoteIfNeeded(val: string): string {
  if (!val.startsWith('$') && !val.startsWith('{') && /[\s&()[\]{};,`]/.test(val)) {
    return `"${val}"`;
  }
  return val;
}

const assembledCommand = computed(() => {
  if (!selectedCmdlet.value) {
    return '';
  }
  const parts: string[] = [selectedCmdlet.value.cmdlet];
  for (const p of selectedCmdlet.value.parameters) {
    if (p.type === 'switch') {
      if (switchValues.value[p.name]) {
        parts.push(`-${p.name}`);
      }
    }
    else {
      const val = (textValues.value[p.name] ?? '').trim();
      if (!val) {
        continue;
      }
      if (p.type === 'string[]') {
        const items = val.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (items.length) {
          parts.push(`-${p.name} ${items.map(quoteIfNeeded).join(',')}`);
        }
      }
      else if (p.type === 'scriptblock') {
        parts.push(`-${p.name} { ${val} }`);
      }
      else {
        parts.push(`-${p.name} ${quoteIfNeeded(val)}`);
      }
    }
  }
  return parts.join(' ');
});

async function copyCommand() {
  if (!assembledCommand.value) {
    return;
  }
  await navigator.clipboard.writeText(assembledCommand.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

// Apply a preset value to a parameter field.
// For string[] params, presets toggle on/off (append/remove from the comma list).
// For all other types, presets toggle on/off (set or clear the field).
function applyPreset(paramName: string, value: string, type: string) {
  if (type === 'string[]') {
    const current = (textValues.value[paramName] ?? '').trim();
    const parts = current ? current.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = parts.indexOf(value);
    if (idx === -1) {
      parts.push(value);
    }
    else {
      parts.splice(idx, 1);
    }
    textValues.value[paramName] = parts.join(', ');
  }
  else {
    const current = (textValues.value[paramName] ?? '').trim();
    textValues.value[paramName] = current === value ? '' : value;
  }
}

function isPresetActive(paramName: string, value: string, type: string): boolean {
  const current = (textValues.value[paramName] ?? '').trim();
  if (type === 'string[]') {
    return current.split(',').map((s: string) => s.trim()).includes(value);
  }
  return current === value;
}

// Substitute any user-entered parameter values into a snippet command string.
// e.g. if the user typed "sriley" for -Identity, every snippet that contains
// "-Identity <something>" will show "-Identity sriley" instead.
function enrichSnippet(command: string): string {
  if (!selectedCmdlet.value) {
    return command;
  }
  let result = command;
  for (const param of selectedCmdlet.value.parameters) {
    if (param.type === 'switch') {
      continue;
    }
    const userVal = (textValues.value[param.name] ?? '').trim();
    if (!userVal) {
      continue;
    }
    const quoted = quoteIfNeeded(userVal);
    // Match -ParamName followed by a braced block, quoted string, or bare word
    const re = new RegExp(
      `(-${param.name}\\s+)(\\{[^}]+\\}|"[^"]*"|'[^']*'|\\S+)`,
      'gi',
    );
    result = result.replace(re, (_m, flag) => `${flag}${quoted}`);
  }
  return result;
}

async function copySnippet(enriched: string, originalKey: string) {
  await navigator.clipboard.writeText(enriched);
  snippetCopied.value = originalKey;
  setTimeout(() => (snippetCopied.value = null), 2000);
}

const cheatsheet = [
  {
    title: 'Comparison Operators',
    rows: [
      { expr: '-eq', desc: 'Equal to' },
      { expr: '-ne', desc: 'Not equal to' },
      { expr: '-gt / -lt', desc: 'Greater than / Less than' },
      { expr: '-ge / -le', desc: 'Greater or equal / Less or equal' },
    ],
  },
  {
    title: 'String Operators',
    rows: [
      { expr: '-like', desc: 'Wildcard match  (* and ?)' },
      { expr: '-notlike', desc: 'Wildcard non-match' },
      { expr: '-match', desc: 'Regex match' },
      { expr: '-notmatch', desc: 'Regex non-match' },
      { expr: '-contains', desc: 'Collection contains value' },
      { expr: '-in', desc: 'Value is in a collection' },
    ],
  },
  {
    title: 'Logical Operators',
    rows: [
      { expr: '-and', desc: 'Both conditions must be true' },
      { expr: '-or', desc: 'Either condition is true' },
      { expr: '-not  or  !', desc: 'Negate a condition' },
    ],
  },
  {
    title: 'Automatic Variables',
    rows: [
      { expr: '$_', desc: 'Current pipeline object' },
      { expr: '$null', desc: 'Null / empty value' },
      { expr: '$true / $false', desc: 'Boolean true / false' },
      { expr: '$env:COMPUTERNAME', desc: 'Local computer name' },
      { expr: '$env:USERNAME', desc: 'Currently logged-on user' },
      { expr: '$PSVersionTable', desc: 'PS version info' },
    ],
  },
  {
    title: 'Date Helpers',
    rows: [
      { expr: '(Get-Date)', desc: 'Current date and time' },
      { expr: '(Get-Date).AddDays(-30)', desc: '30 days ago' },
      { expr: '(Get-Date).AddMonths(-3)', desc: '3 months ago' },
      { expr: '[datetime]"2025-01-01"', desc: 'Parse a date string' },
    ],
  },
  {
    title: 'Pipeline Tricks',
    rows: [
      { expr: '| Select-Object -First 10', desc: 'Limit to first 10 results' },
      { expr: '| Measure-Object', desc: 'Count / sum / min / max' },
      { expr: '| Out-GridView', desc: 'Interactive GUI viewer (local)' },
      { expr: '| ConvertTo-Json', desc: 'Convert output to JSON' },
      { expr: '| Tee-Object -FilePath f.txt', desc: 'Output to screen AND file' },
      { expr: '-ErrorAction SilentlyContinue', desc: 'Suppress non-fatal errors' },
    ],
  },
  {
    title: 'Remote Execution',
    rows: [
      { expr: '-ComputerName SERVER01', desc: 'Many cmdlets support this directly' },
      { expr: 'Invoke-Command -ScriptBlock {}', desc: 'Run via PS Remoting (WinRM)' },
      { expr: 'Enter-PSSession SERVER01', desc: 'Interactive remote PS session' },
    ],
  },
];
</script>

<template>
  <div class="ps-layout">
    <!-- ── Main 2-column area ── -->
    <div class="ps-main">
      <!-- ── Left: Cmdlet Browser ── -->
      <div class="ps-left">
        <c-card title="Cmdlet Browser">
          <!-- Search -->
          <n-input
            v-model:value="cmdletSearch"
            placeholder="Search by name, description, or module..."
            clearable
            style="margin-bottom: 8px;"
          />
          <!-- Category filter pills -->
          <div class="cat-pills">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="cat-pill"
              :class="{ 'cat-pill-active': categoryFilter === cat }"
              @click="categoryFilter = cat; cmdletSearch = ''"
            >
              {{ cat }}
            </button>
          </div>
          <!-- Scrollable cmdlet list -->
          <div class="cmdlet-list">
            <div
              v-for="c in filteredCmdlets"
              :key="c.cmdlet"
              class="cmdlet-row"
              :class="{ 'cmdlet-row-selected': selectedCmdlet?.cmdlet === c.cmdlet }"
              @click="selectCmdlet(c); selectedCmdletName = c.cmdlet"
            >
              <div class="cmdlet-row-top">
                <code class="cmdlet-row-name">{{ c.cmdlet }}</code>
                <span class="cmdlet-row-badge">{{ c.module }}</span>
              </div>
              <div class="cmdlet-row-desc">
                {{ c.description }}
              </div>
            </div>
            <div v-if="filteredCmdlets.length === 0" class="cmdlet-empty">
              No cmdlets match "{{ cmdletSearch }}"
            </div>
          </div>
          <!-- Selected cmdlet meta badges -->
          <div
            v-if="selectedCmdlet"
            style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.07);"
          >
            <code style="font-size: 0.72rem; color: #1ea54c; flex: 1 1 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ selectedCmdlet.cmdlet }}</code>
            <span class="badge" :class="selectedCmdlet.ps51 ? 'ps-yes' : 'ps-no'">PS 5.1</span>
            <span class="badge" :class="selectedCmdlet.ps7 ? 'ps-yes' : 'ps-no'">PS 7</span>
            <span v-if="selectedCmdlet.requiresAdmin" class="badge admin">⚠ Admin</span>
          </div>
        </c-card>
      </div><!-- /ps-left -->

      <!-- ── Right: Generated Command + Parameters ── -->
      <div class="ps-right">
        <!-- Generated Command -->
        <c-card title="Generated Command" style="margin-bottom: 12px;">
          <template v-if="selectedCmdlet">
            <div class="command-block">
              <pre style="margin: 0; white-space: pre-wrap; word-break: break-all; font-size: 0.83rem; color: #1ea54c; line-height: 1.65; font-family: 'Cascadia Code', 'Fira Code', monospace;">{{ assembledCommand }}</pre>
            </div>
            <div style="margin-top: 10px;">
              <n-button size="small" type="primary" @click="copyCommand">
                {{ copied ? '✓ Copied!' : 'Copy Command' }}
              </n-button>
            </div>
            <template v-if="selectedCmdlet.snippets?.length">
              <n-divider style="margin: 16px 0 10px;" />
              <div style="font-size: 0.72rem; font-weight: 700; opacity: 0.45; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;">
                Common Examples
              </div>
              <div
                v-for="snippet in selectedCmdlet.snippets"
                :key="snippet.command"
                class="snippet-row"
                @click="copySnippet(enrichSnippet(snippet.command), snippet.command)"
              >
                <div style="font-size: 0.74rem; opacity: 0.6; margin-bottom: 3px;">
                  {{ snippet.description }}
                </div>
                <code style="font-size: 0.74rem; color: #1ea54c; word-break: break-all; font-family: monospace;">{{ enrichSnippet(snippet.command) }}</code>
                <div
                  v-if="snippetCopied === snippet.command"
                  style="font-size: 0.7rem; color: #1ea54c; margin-top: 3px; opacity: 0.8;"
                >
                  ✓ Copied!
                </div>
              </div>
            </template>
          </template>
          <div v-else style="font-size: 0.85rem; opacity: 0.35; font-style: italic; padding: 4px 0;">
            Select a cmdlet on the left to start building your command.
          </div>
        </c-card>

        <!-- Parameters -->
        <c-card v-if="selectedCmdlet" title="Parameters">
          <div v-if="selectedCmdlet.notes" class="notes-strip">
            {{ selectedCmdlet.notes }}
          </div>
          <div v-if="selectedCmdlet.parameters.length === 0" style="font-size: 0.82rem; opacity: 0.55; font-style: italic;">
            No parameters needed — this cmdlet runs as-is.
          </div>
          <n-divider v-if="visibleParams.length > 0" style="margin: 10px 0 14px;" />

          <!-- Parameter form -->
          <div v-for="param in visibleParams" :key="param.name" style="margin-bottom: 14px;">
            <!-- Switch param -->
            <div v-if="param.type === 'switch'" style="display: flex; align-items: flex-start; gap: 8px; padding: 6px 0;">
              <n-checkbox v-model:checked="switchValues[param.name]">
                <code class="param-code">-{{ param.name }}</code>
              </n-checkbox>
              <span style="font-size: 0.77rem; opacity: 0.6; padding-top: 2px;">
                {{ param.description }}
                <span v-if="param.required" style="color: #e87040; margin-left: 4px;">required</span>
              </span>
            </div>

            <!-- Text / scriptblock / string[] / int param -->
            <template v-else>
              <c-input-text
                v-model:value="textValues[param.name]"
                :label="`-${param.name}${param.required ? ' *' : ''}`"
                :placeholder="param.placeholder ?? param.description"
                :multiline="param.type === 'scriptblock'"
                :rows="param.type === 'scriptblock' ? 2 : undefined"
              />
              <!-- Quick-select preset chips -->
              <div v-if="param.presets?.length" class="preset-chips">
                <button
                  v-for="preset in param.presets"
                  :key="preset.value"
                  type="button"
                  class="preset-chip"
                  :class="{ 'preset-chip-active': isPresetActive(param.name, preset.value, param.type) }"
                  @click="applyPreset(param.name, preset.value, param.type)"
                >
                  {{ preset.label }}
                </button>
              </div>
              <div style="font-size: 0.71rem; opacity: 0.5; margin-top: 2px; padding-left: 2px;">
                {{ param.description }}
                <span v-if="param.type === 'string[]'"> — separate multiple values with commas</span>
                <span v-if="param.type === 'scriptblock'"> — will be wrapped in { }</span>
              </div>
            </template>
          </div>

          <!-- Show all/fewer toggle -->
          <div
            v-if="hiddenParamCount > 0 || showAllParams"
            class="toggle-link"
            @click="showAllParams = !showAllParams"
          >
            {{ showAllParams ? '▲ Show fewer parameters' : `▼ Show ${hiddenParamCount} more parameter${hiddenParamCount !== 1 ? 's' : ''}` }}
          </div>
        </c-card>
      </div><!-- /ps-right -->
    </div><!-- /ps-main -->

    <!-- ── Right: Collapsible Quick Reference ── -->
    <div class="cs-wrap" :class="{ 'cs-open': showCheatsheet }">
      <button type="button" class="cs-toggle" :title="showCheatsheet ? 'Collapse' : 'Expand Quick Reference'" @click="showCheatsheet = !showCheatsheet">
        <span v-if="showCheatsheet" style="font-size: 1.1rem; line-height: 1;">›</span>
        <span v-else class="cs-label">Quick Reference</span>
      </button>
      <div v-show="showCheatsheet" class="cheatsheet-panel">
        <c-card>
          <div class="mb-3 text-base font-bold">
            Quick Reference
          </div>
          <div
            v-for="section in cheatsheet"
            :key="section.title"
            mb-4
          >
            <div class="mb-1 text-xs font-bold uppercase op-60">
              {{ section.title }}
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr
                v-for="row in section.rows"
                :key="row.expr"
                style="border-bottom: 1px solid rgba(255,255,255,0.05);"
              >
                <td style="padding: 3px 8px 3px 0; white-space: nowrap; width: 1%;">
                  <code style="font-size: 0.72rem; color: #1ea54c; background: rgba(30,165,76,0.1); padding: 1px 4px; border-radius: 3px;">{{ row.expr }}</code>
                </td>
                <td style="padding: 3px 0; font-size: 0.72rem; opacity: 0.7; white-space: nowrap;">
                  {{ row.desc }}
                </td>
              </tr>
            </table>
          </div>
        </c-card>
      </div><!-- /cheatsheet-panel -->
    </div><!-- /cs-wrap -->
  </div><!-- /ps-layout -->
</template>

<style scoped>
/* ── Root layout ── */
.ps-layout {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1 1 900px;
  max-width: 1600px;
  margin-top: -28px;
  container-type: inline-size;
}

/* ── Main 2-column area ── */
.ps-main {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  gap: 12px;
  align-items: flex-start;
}

.ps-left {
  flex: 0 0 420px;
  min-width: 0;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #1ea54c33 transparent;
}

.ps-left::-webkit-scrollbar { width: 4px; }
.ps-left::-webkit-scrollbar-track { background: transparent; }
.ps-left::-webkit-scrollbar-thumb { background: #1ea54c44; border-radius: 4px; }

.ps-right {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Collapsible cheatsheet sidebar ── */
.cs-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-shrink: 0;
  width: 32px;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 80px);
}

.cs-toggle {
  flex-shrink: 0;
  width: 24px;
  min-height: 120px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.15s, color 0.15s;
  align-self: stretch;
}

.cs-toggle:hover {
  background: rgba(30,165,76,0.12);
  color: #1ea54c;
  border-color: rgba(30,165,76,0.4);
}

.cs-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
}

.cheatsheet-panel {
  position: absolute;
  right: 34px;
  top: 0;
  width: 500px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  z-index: 50;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Cheatsheet scrollbars */
.cheatsheet-panel::-webkit-scrollbar { width: 4px; }
.cheatsheet-panel::-webkit-scrollbar-track { background: transparent; }
.cheatsheet-panel::-webkit-scrollbar-thumb { background: #1ea54c55; border-radius: 4px; }
.cheatsheet-panel::-webkit-scrollbar-thumb:hover { background: #1ea54c; }

/* ── Param code label ── */
.param-code {
  font-size: 0.78rem;
  color: #1ea54c;
  background: rgba(30,165,76,0.1);
  padding: 1px 5px;
  border-radius: 3px;
}

/* ── Badges ── */
.badge { font-size: 0.68rem; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
.badge.module { background: rgba(255,255,255,0.08); opacity: 0.65; font-family: monospace; font-size: 0.65rem; }
.badge.ps-yes { background: rgba(30,165,76,0.15); color: #1ea54c; }
.badge.ps-no { background: rgba(255,255,255,0.05); opacity: 0.35; text-decoration: line-through; }
.badge.admin { background: rgba(232,112,64,0.15); color: #e87040; }

/* ── Command output block ── */
.command-block {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(30,165,76,0.25);
  border-radius: 6px;
  padding: 12px 14px;
  min-height: 50px;
}

/* ── Snippet rows ── */
.snippet-row {
  padding: 8px 10px; border-radius: 5px; cursor: pointer; margin-bottom: 6px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.1s;
}
.snippet-row:hover { background: rgba(30,165,76,0.07); border-color: rgba(30,165,76,0.3); }

/* ── Category filter pills ── */
.cat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.cat-pill {
  font-size: 0.67rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.cat-pill:hover {
  background: rgba(30,165,76,0.1);
  border-color: rgba(30,165,76,0.35);
  color: #1ea54c;
}

.cat-pill-active {
  background: rgba(30,165,76,0.15) !important;
  border-color: rgba(30,165,76,0.6) !important;
  color: #1ea54c !important;
}

/* ── Cmdlet scrollable list ── */
.cmdlet-list {
  max-height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 -4px;
  padding: 0 4px;
  scrollbar-width: thin;
  scrollbar-color: #1ea54c44 transparent;
}

.cmdlet-list::-webkit-scrollbar { width: 4px; }
.cmdlet-list::-webkit-scrollbar-track { background: transparent; }
.cmdlet-list::-webkit-scrollbar-thumb { background: #1ea54c44; border-radius: 4px; }
.cmdlet-list::-webkit-scrollbar-thumb:hover { background: #1ea54c; }

.cmdlet-row {
  padding: 7px 9px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 3px;
  border: 1px solid transparent;
  transition: background 0.1s, border-color 0.1s;
  min-width: 0;
  overflow: hidden;
}

.cmdlet-row:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.07);
}

.cmdlet-row-selected {
  background: rgba(30,165,76,0.1) !important;
  border-color: rgba(30,165,76,0.35) !important;
}

.cmdlet-row-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.cmdlet-row-name {
  font-size: 0.8rem;
  color: #1ea54c;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  word-break: break-all;
  flex: 1 1 auto;
  min-width: 0;
}

.cmdlet-row-badge {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.35);
  font-family: monospace;
  white-space: nowrap;
  flex-shrink: 0;
}

.cmdlet-row-selected .cmdlet-row-badge {
  background: rgba(30,165,76,0.15);
  color: rgba(30,165,76,0.7);
}

.cmdlet-row-desc {
  font-size: 0.71rem;
  opacity: 0.5;
  line-height: 1.35;
  word-wrap: break-word;
}

.cmdlet-row-selected .cmdlet-row-desc {
  opacity: 0.7;
}

.cmdlet-empty {
  text-align: center;
  padding: 24px 0;
  font-size: 0.8rem;
  opacity: 0.35;
  font-style: italic;
}

/* ── Preset quick-select chips ── */
.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 5px 0 4px;
}

.preset-chip {
  font-size: 0.68rem;
  line-height: 1.5;
  padding: 1px 9px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  font-family: inherit;
}

.preset-chip:hover {
  background: rgba(30,165,76,0.1);
  border-color: rgba(30,165,76,0.4);
  color: #1ea54c;
}

.preset-chip-active {
  background: rgba(30,165,76,0.18) !important;
  border-color: #1ea54c !important;
  color: #1ea54c !important;
}

/* ── Show all toggle link ── */
.toggle-link {
  font-size: 0.78rem; color: #1ea54c; cursor: pointer;
  margin-top: 6px; opacity: 0.8; user-select: none;
}
.toggle-link:hover { opacity: 1; }

/* ── Mobile: stack everything, always show cheatsheet ── */
@media (max-width: 900px) {
  .ps-layout {
    flex-direction: column;
  }

  .ps-main {
    flex-direction: column;
    width: 100%;
  }

  .ps-left {
    flex: none;
    width: 100%;
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .ps-right {
    width: 100%;
  }

  .cs-wrap {
    position: static;
    width: 100% !important;
    max-height: none;
    flex-direction: column;
  }

  .cs-toggle {
    display: none;
  }

  .cheatsheet-panel {
    display: block !important;
    position: static;
    width: 100%;
    max-height: none;
    box-shadow: none;
    border-radius: 0;
    overflow-x: auto;
  }

  .cheatsheet-panel table {
    width: max-content;
    min-width: 100%;
  }
}

/* ── Notes strip ── */
.notes-strip {
  border-left: 3px solid rgba(230, 160, 30, 0.7);
  padding: 4px 0 4px 10px;
  margin-bottom: 14px;
  font-size: 0.75rem;
  line-height: 1.6;
  color: rgba(230, 175, 60, 0.85);
  white-space: pre-line;
}
</style>

<script setup lang="ts">
import { Check, Copy } from '@vicons/tabler';
import { portCategories } from './port-protocol-reference.constants';

const search = ref('');
const copiedValue = ref<string | null>(null);
const filterDangerous = ref(false);
const filterProtocol = ref('');

function copyValue(value: string) {
  navigator.clipboard.writeText(value);
  copiedValue.value = value;
  setTimeout(() => {
    copiedValue.value = null;
  }, 1500);
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return portCategories
    .map(({ category, ports }) => ({
      category,
      ports: ports.filter((p) => {
        if (filterDangerous.value && !p.dangerous) {
          return false;
        }
        if (filterProtocol.value && p.protocol !== filterProtocol.value) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          String(p.port).includes(q)
          || p.service.toLowerCase().includes(q)
          || p.description.toLowerCase().includes(q)
          || p.protocol.toLowerCase().includes(q)
          || category.toLowerCase().includes(q)
          || (p.notes?.toLowerCase().includes(q) ?? false)
        );
      }),
    }))
    .filter(({ ports }) => ports.length > 0);
});

const totalVisible = computed(() => filtered.value.reduce((sum, c) => sum + c.ports.length, 0));
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: -28px;">
    <div mb-4 flex flex-wrap gap-3>
      <c-input-text
        v-model:value="search"
        placeholder="Search by port, service, protocol, or description..."
        autofocus
        raw-text
        style="flex: 1; min-width: 200px;"
      />
      <c-select
        v-model:value="filterProtocol"
        placeholder="All protocols"
        clearable
        style="width: 140px;"
        :options="[
          { label: 'TCP', value: 'TCP' },
          { label: 'UDP', value: 'UDP' },
          { label: 'TCP/UDP', value: 'TCP/UDP' },
        ]"
      />
      <div flex items-center gap-2>
        <n-switch v-model:value="filterDangerous" />
        <span class="text-sm op-70">Dangerous only</span>
      </div>
    </div>

    <div class="mb-6 text-xs op-40">
      Showing {{ totalVisible }} ports
    </div>

    <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
      <template v-for="{ ports, category } of filtered" :key="category">
        <c-card
          v-for="p of ports"
          :key="`${p.port}-${p.protocol}`"
          class="flex flex-col justify-between"
          :class="p.dangerous ? '!border-warning' : ''"
        >
          <div>
            <div mb-2 flex items-start justify-between gap-2>
              <span
                class="text-primary font-bold font-mono"
                style="font-size: 1.4rem; letter-spacing: 0.03em; line-height: 1;"
              >{{ p.port }}</span>
              <div flex items-center gap-1>
                <n-tag :type="p.protocol === 'TCP' ? 'info' : p.protocol === 'UDP' ? 'success' : 'default'" size="small">
                  {{ p.protocol }}
                </n-tag>
                <n-tag v-if="p.dangerous" type="warning" size="small">
                  Dangerous
                </n-tag>
                <c-tooltip :tooltip="copiedValue === String(p.port) ? 'Copied!' : 'Copy port'">
                  <c-button
                    circle
                    variant="text"
                    style="width: 24px; height: 24px;"
                    @click.stop="copyValue(String(p.port))"
                  >
                    <n-icon size="14" :component="copiedValue === String(p.port) ? Check : Copy" />
                  </c-button>
                </c-tooltip>
              </div>
            </div>

            <div class="mb-1 text-xs op-40">
              {{ category }}
            </div>

            <div class="mb-1 text-sm font-semibold">
              {{ p.service }}
            </div>

            <div
              class="mb-2 text-xs text-neutral-500 dark:text-neutral-400"
              style="-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ p.description }}
            </div>

            <div v-if="p.notes" class="mt-1 rounded p-2 text-xs" style="background: rgba(240, 160, 32, 0.1); color: #f0a020;">
              {{ p.notes }}
            </div>
          </div>
        </c-card>
      </template>
    </div>
  </div>
</template>

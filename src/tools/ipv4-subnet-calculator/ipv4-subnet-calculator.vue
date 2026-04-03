<script setup lang="ts">
import { Netmask } from 'netmask';
import { useStorage } from '@vueuse/core';
import { ArrowLeft, ArrowRight } from '@vicons/tabler';
import { getIPClass } from './ipv4-subnet-calculator.models';
import { withDefaultOnError } from '@/utils/defaults';
import { isNotThrowing } from '@/utils/boolean';
import SpanCopyable from '@/components/SpanCopyable.vue';

const ip = useStorage('ipv4-subnet-calculator:ip', '192.168.0.1/24');

const getNetworkInfo = (address: string) => new Netmask(address.trim());

const networkInfo = computed(() => withDefaultOnError(() => getNetworkInfo(ip.value), undefined));

const ipValidationRules = [
  {
    message: 'We cannot parse this address, check the format',
    validator: (value: string) => isNotThrowing(() => getNetworkInfo(value.trim())),
  },
];

function isPrivateIP(base: string): boolean {
  const parts = base.split('.').map(Number);
  if (parts[0] === 10) {
    return true;
  }
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }
  if (parts[0] === 192 && parts[1] === 168) {
    return true;
  }
  if (parts[0] === 169 && parts[1] === 254) {
    return true;
  }
  if (parts[0] === 127) {
    return true;
  }
  return false;
}

const usableHosts = computed(() => {
  if (!networkInfo.value) {
    return null;
  }
  const size = networkInfo.value.size;
  if (size <= 2) {
    return size === 2 ? 0 : 1;
  }
  return size - 2;
});

const isPrivate = computed(() => {
  if (!networkInfo.value) {
    return null;
  }
  return isPrivateIP(networkInfo.value.base);
});

const sections: {
  label: string
  getValue: (blocks: Netmask) => string | undefined
  undefinedFallback?: string
}[] = [
  {
    label: 'Netmask',
    getValue: block => block.toString(),
  },
  {
    label: 'Network address',
    getValue: ({ base }) => base,
  },
  {
    label: 'Network mask',
    getValue: ({ mask }) => mask,
  },
  {
    label: 'Network mask in binary',
    getValue: ({ bitmask }) => ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.') ?? '',
  },
  {
    label: 'CIDR notation',
    getValue: ({ bitmask }) => `/${bitmask}`,
  },
  {
    label: 'Wildcard mask',
    getValue: ({ hostmask }) => hostmask,
  },
  {
    label: 'Network size',
    getValue: ({ size }) => String(size),
  },
  {
    label: 'First address',
    getValue: ({ first }) => first,
  },
  {
    label: 'Last address',
    getValue: ({ last }) => last,
  },
  {
    label: 'Broadcast address',
    getValue: ({ broadcast }) => broadcast,
    undefinedFallback: 'No broadcast address with this mask',
  },
  {
    label: 'IP class',
    getValue: ({ base: ip }) => getIPClass({ ip }),
    undefinedFallback: 'Unknown class type',
  },
];

const cheatSheet = [
  { cidr: '/8', mask: '255.0.0.0', hosts: '16,777,214', size: 16777216 },
  { cidr: '/16', mask: '255.255.0.0', hosts: '65,534', size: 65536 },
  { cidr: '/20', mask: '255.255.240.0', hosts: '4,094', size: 4096 },
  { cidr: '/21', mask: '255.255.248.0', hosts: '2,046', size: 2048 },
  { cidr: '/22', mask: '255.255.252.0', hosts: '1,022', size: 1024 },
  { cidr: '/23', mask: '255.255.254.0', hosts: '510', size: 512 },
  { cidr: '/24', mask: '255.255.255.0', hosts: '254', size: 256 },
  { cidr: '/25', mask: '255.255.255.128', hosts: '126', size: 128 },
  { cidr: '/26', mask: '255.255.255.192', hosts: '62', size: 64 },
  { cidr: '/27', mask: '255.255.255.224', hosts: '30', size: 32 },
  { cidr: '/28', mask: '255.255.255.240', hosts: '14', size: 16 },
  { cidr: '/29', mask: '255.255.255.248', hosts: '6', size: 8 },
  { cidr: '/30', mask: '255.255.255.252', hosts: '2', size: 4 },
  { cidr: '/31', mask: '255.255.255.254', hosts: '2 (P2P)', size: 2 },
  { cidr: '/32', mask: '255.255.255.255', hosts: '1 (host)', size: 1 },
];

const currentBitmask = computed(() => networkInfo.value?.bitmask ?? null);

function switchToBlock({ count = 1 }: { count?: number }) {
  const next = networkInfo.value?.next(count);
  if (next) {
    ip.value = next.toString();
  }
}
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div class="grid grid-cols-1 gap-16px lg:grid-cols-2" style="align-items: start;">
      <!-- Left: Input + Results -->
      <div>
        <c-input-text
          v-model:value="ip"
          label="An IPv4 address with or without mask"
          placeholder="The ipv4 address..."
          :validation-rules="ipValidationRules"
          mb-4
        />

        <div v-if="networkInfo">
          <div mb-3 flex items-center gap-2>
            <n-tag :type="isPrivate ? 'success' : 'warning'" size="medium">
              {{ isPrivate ? 'Private' : 'Public' }} IP Range
            </n-tag>
            <n-tag type="info" size="medium">
              {{ usableHosts?.toLocaleString() }} usable hosts
            </n-tag>
          </div>

          <div class="subnet-results">
            <div
              v-for="{ getValue, label, undefinedFallback } in sections"
              :key="label"
              class="subnet-row"
            >
              <span class="subnet-label">{{ label }}</span>
              <span class="subnet-value">
                <SpanCopyable v-if="getValue(networkInfo)" :value="getValue(networkInfo)" />
                <span v-else op-70>{{ undefinedFallback }}</span>
              </span>
            </div>
          </div>

          <div mt-3 flex items-center justify-between>
            <c-button @click="switchToBlock({ count: -1 })">
              <n-icon :component="ArrowLeft" />
              Previous block
            </c-button>
            <c-button @click="switchToBlock({ count: 1 })">
              Next block
              <n-icon :component="ArrowRight" />
            </c-button>
          </div>
        </div>
      </div>

      <!-- Right: Cheat Sheet -->
      <div>
        <div mb-3 text-lg op-80>
          Subnet Cheat Sheet
        </div>
        <div class="grid grid-cols-2 gap-8px sm:grid-cols-3">
          <c-card
            v-for="row in cheatSheet"
            :key="row.cidr"
            class="flex flex-col"
            :class="currentBitmask !== null && String(currentBitmask) === row.cidr.replace('/', '') ? '!border-primary' : ''"
            style="padding: 10px 14px;"
          >
            <span class="text-primary font-bold font-mono" style="font-size: 1.2rem;">{{ row.cidr }}</span>
            <span class="mt-1 text-xs op-60">{{ row.mask }}</span>
            <span class="mt-1 text-sm font-semibold">{{ row.hosts }} hosts</span>
          </c-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subnet-results {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  overflow: hidden;
}
.subnet-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  align-items: baseline;
}
.subnet-row:last-child {
  border-bottom: none;
}
.subnet-label {
  font-weight: 600;
  min-width: 180px;
  flex-shrink: 0;
  opacity: 0.85;
}
@media (max-width: 480px) {
  .subnet-label {
    min-width: 100%;
    font-size: 0.8rem;
    opacity: 0.6;
    margin-bottom: 0;
  }
  .subnet-value {
    font-family: monospace;
  }
}
</style>

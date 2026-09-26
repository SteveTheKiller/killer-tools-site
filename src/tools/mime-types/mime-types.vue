<script setup lang="ts">
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from 'mime-types';

const { t } = useI18n();

const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }));

const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map(label => ({ label, value: label }));
const selectedMimeType = ref(undefined);

const extensionsFound = computed(() => (selectedMimeType.value ? mimeTypeToExtension[selectedMimeType.value] : []));

const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((label) => {
  const extension = `.${label}`;

  return { label: extension, value: label };
});
const selectedExtension = ref(undefined);

const mimeTypeFound = computed(() => (selectedExtension.value ? extensionToMimeType[selectedExtension.value] : []));
</script>

<template>
  <div style="flex: 1 1 900px; max-width: 1400px; margin-top: 0;">
    <div class="grid grid-cols-1 gap-16px xl:grid-cols-2" style="align-items: start;">
      <!-- Left: Lookup cards -->
      <div class="grid grid-cols-1 gap-16px">
        <c-card>
          <n-h2 style="margin-bottom: 0">
            {{ t('tools.mime-types.ui.mimeToExtensionTitle') }}
          </n-h2>
          <div style="opacity: 0.8">
            {{ t('tools.mime-types.ui.mimeToExtensionDescription') }}
          </div>
          <c-select
            v-model:value="selectedMimeType"
            searchable
            my-4
            :options="mimeToExtensionsOptions"
            :placeholder="t('tools.mime-types.ui.mimeTypeSelectPlaceholder')"
          />

          <div v-if="extensionsFound.length > 0">
            {{ t('tools.mime-types.ui.extensionsFoundPrefix') }} <span class="kt-tag kt-tag-default">{{ selectedMimeType }}</span> {{ t('tools.mime-types.ui.extensionsFoundSuffix') }}
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
              <span v-for="extension of extensionsFound" :key="extension" class="kt-tag kt-tag-primary">.{{ extension }}</span>
            </div>
          </div>
        </c-card>

        <c-card>
          <n-h2 style="margin-bottom: 0">
            {{ t('tools.mime-types.ui.extensionToMimeTitle') }}
          </n-h2>
          <div style="opacity: 0.8">
            {{ t('tools.mime-types.ui.extensionToMimeDescription') }}
          </div>
          <c-select
            v-model:value="selectedExtension"
            searchable
            my-4
            :options="extensionToMimeTypeOptions"
            :placeholder="t('tools.mime-types.ui.mimeTypeSelectPlaceholder')"
          />

          <div v-if="selectedExtension">
            {{ t('tools.mime-types.ui.mimeFoundPrefix') }} <span class="kt-tag kt-tag-default">{{ selectedExtension }}</span> {{ t('tools.mime-types.ui.mimeFoundSuffix') }}
            <div style="margin-top: 10px;">
              <span class="kt-tag kt-tag-primary">{{ mimeTypeFound }}</span>
            </div>
          </div>
        </c-card>
      </div>

      <!-- Right: Full table -->
      <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
        <n-table style="min-width: 420px;">
          <thead>
            <tr>
              <th>{{ t('tools.mime-types.ui.tableMimeTypesHeader') }}</th>
              <th>{{ t('tools.mime-types.ui.tableExtensionsHeader') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ mimeType, extensions } of mimeInfos" :key="mimeType">
              <td>{{ mimeType }}</td>
              <td>
                <span v-for="extension of extensions" :key="extension" class="kt-tag kt-tag-default" style="margin-right: 6px;">.{{ extension }}</span>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </div>
  </div>
</template>

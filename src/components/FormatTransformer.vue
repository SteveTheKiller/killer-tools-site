<script setup lang="ts">
import type { UseValidationRule } from '@/composable/validation';
import _ from 'lodash';
import CInputText from '@/ui/c-input-text/c-input-text.vue';

const props = withDefaults(
  defineProps<{
    transformer?: (v: string) => string
    inputValidationRules?: UseValidationRule<string>[]
    inputLabel?: string
    inputPlaceholder?: string
    inputDefault?: string
    outputLabel?: string
    outputLanguage?: string
  }>(),
  {
    transformer: _.identity,
    inputValidationRules: () => [],
    inputLabel: undefined,
    inputDefault: '',
    inputPlaceholder: undefined,
    outputLabel: undefined,
    outputLanguage: '',
  },
);

const { t } = useI18n();

const { transformer, inputValidationRules, outputLanguage, inputDefault }
  = toRefs(props);
const inputLabel = computed(() => props.inputLabel ?? t('components.formatTransformer.input'));
const inputPlaceholder = computed(() => props.inputPlaceholder ?? t('components.formatTransformer.inputPlaceholder'));
const outputLabel = computed(() => props.outputLabel ?? t('components.formatTransformer.output'));

const inputElement = ref<typeof CInputText>();

const input = ref(inputDefault.value);
const output = computed(() => transformer.value(input.value));
</script>

<template>
  <!-- Single element root: pages render this component as their root, and a
       fragment root breaks the route <transition mode="out-in"> (blank page) -->
  <div style="display: contents">
    <CInputText
      ref="inputElement"
      v-model:value="input"
      :placeholder="inputPlaceholder"
      :label="inputLabel"
      rows="20"
      autosize
      raw-text
      multiline
      test-id="input"
      :validation-rules="inputValidationRules"
      monospace
    />

    <div overflow-auto>
      <div mb-5px>
        {{ outputLabel }}
      </div>
      <textarea-copyable :value="output" :language="outputLanguage" :follow-height-of="inputElement?.inputWrapperRef" />
    </div>
  </div>
</template>

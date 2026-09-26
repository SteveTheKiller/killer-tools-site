<script setup lang="ts">
import type { SignatureInfo } from '../pdf-signature-checker.types';

type Cert = SignatureInfo['meta']['certs'][number];
interface ValidityPeriod { notBefore: string, notAfter: string }
type IssuedParty = Cert['issuedBy'];

const props = defineProps<{ signature: SignatureInfo }>();

const { t } = useI18n();

const { signature } = toRefs(props);

const tableHeaders = computed(() => ({
  validityPeriod: t('tools.pdf-signature-checker.ui.tableHeaderValidityPeriod'),
  issuedBy: t('tools.pdf-signature-checker.ui.tableHeaderIssuedBy'),
  issuedTo: t('tools.pdf-signature-checker.ui.tableHeaderIssuedTo'),
  pemCertificate: t('tools.pdf-signature-checker.ui.tableHeaderPemCertificate'),
}));

const certs = computed(() => signature.value.meta.certs.map((certificate, index) => ({
  ...certificate,
  validityPeriod: {
    notBefore: new Date(certificate.validityPeriod.notBefore).toLocaleString(),
    notAfter: new Date(certificate.validityPeriod.notAfter).toLocaleString(),
  },
  certificateName: `Certificate ${index + 1}`,
})),
);
</script>

<template>
  <div flex flex-col gap-2>
    <c-table :data="certs" :headers="tableHeaders">
      <template #validityPeriod="{ value: vp }">
        <c-key-value-list
          :items="[{
            label: t('tools.pdf-signature-checker.ui.notBefore'),
            value: (vp as ValidityPeriod).notBefore,
          }, {
            label: t('tools.pdf-signature-checker.ui.notAfter'),
            value: (vp as ValidityPeriod).notAfter,
          }]"
        />
      </template>

      <template #issuedBy="{ value: party }">
        <c-key-value-list
          :items="[{
            label: t('tools.pdf-signature-checker.ui.commonName'),
            value: (party as IssuedParty).commonName,
          }, {
            label: t('tools.pdf-signature-checker.ui.organizationName'),
            value: (party as IssuedParty).organizationName,
          }, {
            label: t('tools.pdf-signature-checker.ui.countryName'),
            value: (party as IssuedParty).countryName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.localityName'),
            value: (party as IssuedParty).localityName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.organizationalUnitName'),
            value: (party as IssuedParty).organizationalUnitName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.stateOrProvinceName'),
            value: (party as IssuedParty).stateOrProvinceName ?? '',
          }]"
        />
      </template>

      <template #issuedTo="{ value: party }">
        <c-key-value-list
          :items="[{
            label: t('tools.pdf-signature-checker.ui.commonName'),
            value: (party as IssuedParty).commonName,
          }, {
            label: t('tools.pdf-signature-checker.ui.organizationName'),
            value: (party as IssuedParty).organizationName,
          }, {
            label: t('tools.pdf-signature-checker.ui.countryName'),
            value: (party as IssuedParty).countryName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.localityName'),
            value: (party as IssuedParty).localityName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.organizationalUnitName'),
            value: (party as IssuedParty).organizationalUnitName ?? '',
          }, {
            label: t('tools.pdf-signature-checker.ui.stateOrProvinceName'),
            value: (party as IssuedParty).stateOrProvinceName ?? '',
          }]"
        />
      </template>

      <template #pemCertificate="{ value: pem }">
        <c-modal-value :value="(pem as string)" :label="t('tools.pdf-signature-checker.ui.viewPemCert')">
          <template #value>
            <div break-all text-xs>
              {{ pem }}
            </div>
          </template>
        </c-modal-value>
      </template>
    </c-table>
  </div>
</template>

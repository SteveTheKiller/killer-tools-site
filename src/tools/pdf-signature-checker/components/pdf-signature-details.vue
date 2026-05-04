<script setup lang="ts">
import type { SignatureInfo } from '../pdf-signature-checker.types';

type Cert = SignatureInfo['meta']['certs'][number];
interface ValidityPeriod { notBefore: string, notAfter: string }
type IssuedParty = Cert['issuedBy'];

const props = defineProps<{ signature: SignatureInfo }>();
const { signature } = toRefs(props);

const tableHeaders = {
  validityPeriod: 'Validity period',
  issuedBy: 'Issued by',
  issuedTo: 'Issued to',
  pemCertificate: 'PEM certificate',
};

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
            label: 'Not before',
            value: (vp as ValidityPeriod).notBefore,
          }, {
            label: 'Not after',
            value: (vp as ValidityPeriod).notAfter,
          }]"
        />
      </template>

      <template #issuedBy="{ value: party }">
        <c-key-value-list
          :items="[{
            label: 'Common name',
            value: (party as IssuedParty).commonName,
          }, {
            label: 'Organization name',
            value: (party as IssuedParty).organizationName,
          }, {
            label: 'Country name',
            value: (party as IssuedParty).countryName ?? '',
          }, {
            label: 'Locality name',
            value: (party as IssuedParty).localityName ?? '',
          }, {
            label: 'Organizational unit name',
            value: (party as IssuedParty).organizationalUnitName ?? '',
          }, {
            label: 'State or province name',
            value: (party as IssuedParty).stateOrProvinceName ?? '',
          }]"
        />
      </template>

      <template #issuedTo="{ value: party }">
        <c-key-value-list
          :items="[{
            label: 'Common name',
            value: (party as IssuedParty).commonName,
          }, {
            label: 'Organization name',
            value: (party as IssuedParty).organizationName,
          }, {
            label: 'Country name',
            value: (party as IssuedParty).countryName ?? '',
          }, {
            label: 'Locality name',
            value: (party as IssuedParty).localityName ?? '',
          }, {
            label: 'Organizational unit name',
            value: (party as IssuedParty).organizationalUnitName ?? '',
          }, {
            label: 'State or province name',
            value: (party as IssuedParty).stateOrProvinceName ?? '',
          }]"
        />
      </template>

      <template #pemCertificate="{ value: pem }">
        <c-modal-value :value="(pem as string)" label="View PEM cert">
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

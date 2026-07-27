import type { ToolCategory } from './tools.types';
import { tool as asciiTextDrawer } from './ascii-text-drawer';
import { tool as base64FileConverter } from './base64-file-converter';
import { tool as base64StringConverter } from './base64-string-converter';
import { tool as bcrypt } from './bcrypt';
import { tool as bip39 } from './bip39-generator';
import { tool as cameraRecorder } from './camera-recorder';
import { tool as caseConverter } from './case-converter';
import { tool as chmodCalculator } from './chmod-calculator';
import { tool as colorConverter } from './color-converter';
import { tool as crontabGenerator } from './crontab-generator';
import { tool as cveLookup } from './cve-lookup';
import { tool as dateTimeConverter } from './date-time-converter';
import { tool as depthOfFieldCalculator } from './depth-of-field-calculator';
import { tool as devCalculator } from './dev-calculator';
import { tool as deviceInformation } from './device-information';
import { tool as domainLookup } from './domain-lookup'; // whois-checker and email-dns-checker merged here
import { tool as emailHeaderParser } from './email-header-parser';
import { tool as emailRecordGenerator } from './email-record-generator';
import { tool as emojiPicker } from './emoji-picker';
import { tool as cypher } from './encryption';
import { tool as exchangeNdrLookup } from './exchange-ndr-lookup';
import { tool as exposureEquivalence } from './exposure-equivalence';
import { tool as gifSearch } from './gif-search';
import { tool as groupPolicyReference } from './group-policy-reference';
import { tool as hashText } from './hash-text';
import { tool as hmacGenerator } from './hmac-generator';
import { tool as htmlEntities } from './html-entities';
import { tool as htmlWysiwygEditor } from './html-wysiwyg-editor';
import { tool as httpStatusCodes } from './http-status-codes';
import { tool as baseConverter } from './integer-base-converter';
import { tool as ipv4RangeExpander } from './ipv4-range-expander';
import { tool as ipv4SubnetCalculator } from './ipv4-subnet-calculator';
import { tool as ipv6UlaGenerator } from './ipv6-ula-generator';
import { tool as jsonConverter } from './json-converter';
import { tool as jsonDiff } from './json-diff';
import { tool as jsonMinify } from './json-minify';
import { tool as jsonToCsv } from './json-to-csv';
import { tool as jsonViewer } from './json-viewer';
import { tool as jwtParser } from './jwt-parser';
import { tool as keycodeInfo } from './keycode-info';
import { tool as killerModules } from './killer-modules';
import { tool as killerNotes } from './killer-notes';
import { tool as killerPdf } from './killer-pdf';
import { tool as killerScan } from './killer-scan';
import { tool as killerScripts } from './killer-scripts';
import { tool as killerShell } from './killer-shell';
import { tool as loremIpsumGenerator } from './lorem-ipsum-generator';
import { tool as m365SkuDecoder } from './m365-sku-decoder';
import { tool as macAddressLookup } from './mac-address-lookup';
import { tool as markdownToHtml } from './markdown-to-html';
import { tool as mathEvaluator } from './math-evaluator';
import { tool as metaTagGenerator } from './meta-tag-generator';
import { tool as ndFilterCalculator } from './nd-filter-calculator';
import { tool as otpCodeGeneratorAndValidator } from './otp-code-generator-and-validator';
import { tool as passwordGenerator } from './password-generator';
import { tool as passwordStrengthAnalyser } from './password-strength-analyser';
import { tool as pdfSignatureChecker } from './pdf-signature-checker';
import { tool as percentageCalculator } from './percentage-calculator';
import { tool as phoneParserAndFormatter } from './phone-parser-and-formatter';
import { tool as portProtocolReference } from './port-protocol-reference';
import { tool as powershellBuilder } from './powershell-builder';
import { tool as qrCodeGenerator } from './qr-code-generator';
import { tool as reciprocityCalculator } from './reciprocity-calculator';
import { tool as regexTester } from './regex-tester';
import { tool as romanNumeralConverter } from './roman-numeral-converter';
import { tool as rsaKeyPairGenerator } from './rsa-key-pair-generator';
import { tool as sqlPrettify } from './sql-prettify';
import { tool as svgPlaceholderGenerator } from './svg-placeholder-generator';
import { tool as temperatureConverter } from './temperature-converter';
import { tool as textDiff } from './text-diff';
import { tool as textStatistics } from './text-statistics';
import { tool as textToBinary } from './text-to-binary';
import { tool as textToNatoAlphabet } from './text-to-nato-alphabet';
import { tool as tomlConverter } from './toml-converter';
import { tool as ulidGenerator } from './ulid-generator';
import { tool as urlParser } from './url-parser';
import { tool as userAgentParser } from './user-agent-parser';
import { tool as uuidGenerator } from './uuid-generator';
import { tool as windowsErrorCodes } from './windows-error-codes';
import { tool as windowsEventLookup } from './windows-event-lookup';
import { tool as signatureCreator } from './signature-creator';
import { tool as xmlFormatter } from './xml-formatter';
import { tool as xmlJsonConverter } from './xml-json-converter';
import { tool as yamlConverter } from './yaml-converter';
import { tool as yamlViewer } from './yaml-viewer';

export const toolsByCategory: ToolCategory[] = [
  {
    name: 'Windows',
    components: [
      killerScripts,
      killerModules,
      exchangeNdrLookup,
      groupPolicyReference,
      m365SkuDecoder,
      powershellBuilder,
      windowsErrorCodes,
      windowsEventLookup,
      killerPdf,
      killerShell,
      killerNotes,
    ],
  },
  {
    name: 'Network',
    components: [
      killerScan,
      cveLookup,
      domainLookup,
      emailHeaderParser,
      emailRecordGenerator,
      ipv4RangeExpander,
      ipv4SubnetCalculator,
      ipv6UlaGenerator,
      macAddressLookup,
      portProtocolReference,
    ],
  },
  {
    name: 'Conversion',
    components: [
      base64FileConverter,
      base64StringConverter,
      baseConverter,
      caseConverter,
      colorConverter,
      dateTimeConverter,
      jsonConverter,
      markdownToHtml,
      mathEvaluator,
      percentageCalculator,
      romanNumeralConverter,
      temperatureConverter,
      textToBinary,
      textToNatoAlphabet,
      tomlConverter,
      xmlJsonConverter,
      yamlConverter,
    ],
  },
  {
    name: 'Web',
    components: [
      deviceInformation,
      htmlEntities,
      htmlWysiwygEditor,
      httpStatusCodes,
      jsonDiff,
      jwtParser,
      keycodeInfo,
      metaTagGenerator,
      otpCodeGeneratorAndValidator,
      phoneParserAndFormatter,
      urlParser,
      userAgentParser,
    ],
  },
  {
    name: 'Text',
    components: [
      asciiTextDrawer,
      emojiPicker,
      loremIpsumGenerator,
      textDiff,
      textStatistics,
    ],
  },
  {
    name: 'Crypto',
    components: [
      passwordGenerator,
      bcrypt,
      bip39,
      cypher,
      hashText,
      hmacGenerator,
      passwordStrengthAnalyser,
      pdfSignatureChecker,
      rsaKeyPairGenerator,
      ulidGenerator,
      uuidGenerator,
    ],
  },
  {
    name: 'Development',
    components: [
      chmodCalculator,
      crontabGenerator,
      jsonMinify,
      jsonToCsv,
      jsonViewer,
      regexTester,
      sqlPrettify,
      xmlFormatter,
      yamlViewer,
    ],
  },
  {
    name: 'Photography',
    components: [
      depthOfFieldCalculator,
      exposureEquivalence,
      devCalculator,
      ndFilterCalculator,
      reciprocityCalculator,
    ],
  },
  {
    name: 'Images and videos',
    components: [
      gifSearch,
      cameraRecorder,
      qrCodeGenerator,
      signatureCreator,
      svgPlaceholderGenerator,
    ],
  },
];

export const tools = toolsByCategory.flatMap(({ components }) => components);
export const toolsWithCategory = toolsByCategory.flatMap(({ components, name }) =>
  components.map(tool => ({ category: name, ...tool })),
);

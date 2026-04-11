import { tool as base64FileConverter } from './base64-file-converter';
import { tool as base64StringConverter } from './base64-string-converter';
import { tool as basicAuthGenerator } from './basic-auth-generator';
import { tool as emailNormalizer } from './email-normalizer';
import { tool as asciiTextDrawer } from './ascii-text-drawer';
import { tool as killerScripts } from './killer-scripts';
import { tool as killerPdf } from './killer-pdf';
import { tool as killerScan } from './killer-scan';
import { tool as textToUnicode } from './text-to-unicode';
import { tool as safelinkDecoder } from './safelink-decoder';
import { tool as regexTester } from './regex-tester';
import { tool as markdownToHtml } from './markdown-to-html';
import { tool as pdfSignatureChecker } from './pdf-signature-checker';
import { tool as numeronymGenerator } from './numeronym-generator';
import { tool as textToBinary } from './text-to-binary';
import { tool as ulidGenerator } from './ulid-generator';
import { tool as ibanValidatorAndParser } from './iban-validator-and-parser';
import { tool as stringObfuscator } from './string-obfuscator';
import { tool as textDiff } from './text-diff';
import { tool as emojiPicker } from './emoji-picker';
import { tool as passwordStrengthAnalyser } from './password-strength-analyser';
import { tool as jsonToCsv } from './json-to-csv';
import { tool as cameraRecorder } from './camera-recorder';
import { tool as listConverter } from './list-converter';
import { tool as phoneParserAndFormatter } from './phone-parser-and-formatter';
import { tool as jsonDiff } from './json-diff';
import { tool as ipv4RangeExpander } from './ipv4-range-expander';
import { tool as httpStatusCodes } from './http-status-codes';
import { tool as ipv6UlaGenerator } from './ipv6-ula-generator';
import { tool as ipv4AddressConverter } from './ipv4-address-converter';
import { tool as benchmarkBuilder } from './benchmark-builder';
import { tool as userAgentParser } from './user-agent-parser';
import { tool as ipv4SubnetCalculator } from './ipv4-subnet-calculator';
import { tool as htmlWysiwygEditor } from './html-wysiwyg-editor';
import { tool as rsaKeyPairGenerator } from './rsa-key-pair-generator';
import { tool as textToNatoAlphabet } from './text-to-nato-alphabet';
import { tool as slugifyString } from './slugify-string';
import { tool as keycodeInfo } from './keycode-info';
import { tool as jsonMinify } from './json-minify';
import { tool as bcrypt } from './bcrypt';
import { tool as bip39 } from './bip39-generator';
import { tool as caseConverter } from './case-converter';
import { tool as chmodCalculator } from './chmod-calculator';
import { tool as chronometer } from './chronometer';
import { tool as colorConverter } from './color-converter';
import { tool as crontabGenerator } from './crontab-generator';
import { tool as dateTimeConverter } from './date-time-converter';
import { tool as deviceInformation } from './device-information';
import { tool as cypher } from './encryption';
import { tool as etaCalculator } from './eta-calculator';
import { tool as percentageCalculator } from './percentage-calculator';
import { tool as hashText } from './hash-text';
import { tool as hmacGenerator } from './hmac-generator';
import { tool as htmlEntities } from './html-entities';
import { tool as baseConverter } from './integer-base-converter';
import { tool as jsonViewer } from './json-viewer';
import { tool as jwtParser } from './jwt-parser';
import { tool as loremIpsumGenerator } from './lorem-ipsum-generator';
import { tool as mathEvaluator } from './math-evaluator';
import { tool as metaTagGenerator } from './meta-tag-generator';
import { tool as mimeTypes } from './mime-types';
import { tool as otpCodeGeneratorAndValidator } from './otp-code-generator-and-validator';
import { tool as qrCodeGenerator } from './qr-code-generator';
import { tool as wifiQrCodeGenerator } from './wifi-qr-code-generator';
import { tool as randomPortGenerator } from './random-port-generator';
import { tool as romanNumeralConverter } from './roman-numeral-converter';
import { tool as sqlPrettify } from './sql-prettify';
import { tool as svgPlaceholderGenerator } from './svg-placeholder-generator';
import { tool as temperatureConverter } from './temperature-converter';
import { tool as textStatistics } from './text-statistics';
import { tool as tokenGenerator } from './token-generator';
import type { ToolCategory } from './tools.types';
import { tool as urlEncoder } from './url-encoder';
import { tool as urlParser } from './url-parser';
import { tool as uuidGenerator } from './uuid-generator';
import { tool as macAddressLookup } from './mac-address-lookup';
import { tool as xmlFormatter } from './xml-formatter';
import { tool as yamlViewer } from './yaml-viewer';
import { tool as windowsEventLookup } from './windows-event-lookup';
import { tool as powershellBuilder } from './powershell-builder';
import { tool as m365SkuDecoder } from './m365-sku-decoder';
import { tool as groupPolicyReference } from './group-policy-reference';
import { tool as windowsErrorCodes } from './windows-error-codes';
import { tool as domainLookup } from './domain-lookup';
import { tool as emailRecordGenerator } from './email-record-generator';
import { tool as exchangeNdrLookup } from './exchange-ndr-lookup';
import { tool as cveLookup } from './cve-lookup';
import { tool as portProtocolReference } from './port-protocol-reference';

// whois-checker and email-dns-checker merged into domain-lookup
import { tool as emailHeaderParser } from './email-header-parser';
import { tool as xmlJsonConverter } from './xml-json-converter';
import { tool as yamlConverter } from './yaml-converter';
import { tool as jsonConverter } from './json-converter';
import { tool as tomlConverter } from './toml-converter';

export const toolsByCategory: ToolCategory[] = [
  {
    name: 'Windows',
    components: [
      killerScripts,
      exchangeNdrLookup,
      groupPolicyReference,
      m365SkuDecoder,
      powershellBuilder,
      safelinkDecoder,
      windowsErrorCodes,
      windowsEventLookup,
      killerPdf,
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
      ipv4AddressConverter,
      ipv4RangeExpander,
      ipv4SubnetCalculator,
      ipv6UlaGenerator,
      macAddressLookup,
      portProtocolReference,
    ],
  },
  {
    name: 'Web',
    components: [
      basicAuthGenerator,
      deviceInformation,
      htmlEntities,
      htmlWysiwygEditor,
      httpStatusCodes,
      jsonDiff,
      jwtParser,
      keycodeInfo,
      metaTagGenerator,
      mimeTypes,
      otpCodeGeneratorAndValidator,
      slugifyString,
      urlEncoder,
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
      numeronymGenerator,
      stringObfuscator,
      textDiff,
      textStatistics,
    ],
  },
  {
    name: 'Crypto',
    components: [
      bcrypt,
      bip39,
      cypher,
      hashText,
      hmacGenerator,
      passwordStrengthAnalyser,
      pdfSignatureChecker,
      rsaKeyPairGenerator,
      tokenGenerator,
      ulidGenerator,
      uuidGenerator,
    ],
  },
  {
    name: 'Development',
    components: [
      chmodCalculator,
      crontabGenerator,
      emailNormalizer,
      jsonMinify,
      jsonToCsv,
      jsonViewer,
      randomPortGenerator,
      regexTester,
      sqlPrettify,
      xmlFormatter,
      yamlViewer,
    ],
  },
  {
    name: 'Converter',
    components: [
      base64FileConverter,
      base64StringConverter,
      baseConverter,
      caseConverter,
      colorConverter,
      dateTimeConverter,
      jsonConverter,
      listConverter,
      markdownToHtml,
      romanNumeralConverter,
      textToBinary,
      textToNatoAlphabet,
      textToUnicode,
      tomlConverter,
      xmlJsonConverter,
      yamlConverter,
    ],
  },
  {
    name: 'Images and videos',
    components: [
      cameraRecorder,
      qrCodeGenerator,
      svgPlaceholderGenerator,
      wifiQrCodeGenerator,
    ],
  },
  {
    name: 'Math',
    components: [
      etaCalculator,
      mathEvaluator,
      percentageCalculator,
    ],
  },
  {
    name: 'Measurement',
    components: [
      benchmarkBuilder,
      chronometer,
      temperatureConverter,
    ],
  },
  {
    name: 'Data',
    components: [
      ibanValidatorAndParser,
      phoneParserAndFormatter,
    ],
  },
];

export const tools = toolsByCategory.flatMap(({ components }) => components);
export const toolsWithCategory = toolsByCategory.flatMap(({ components, name }) =>
  components.map(tool => ({ category: name, ...tool })),
);

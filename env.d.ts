/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  VITE_PLAUSIBLE_API_HOST: string
  VITE_PLAUSIBLE_DOMAIN: string
  PACKAGE_VERSION: string
  GIT_SHORT_SHA: string
  PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// @vicons/tabler ambient declarations — installed version lacks type definitions
declare module '@vicons/tabler' {
  import type { Component } from 'vue';

  export const Activity: Component;
  export const Adjustments: Component;
  export const Alarm: Component;
  export const AlignJustified: Component;
  export const AlertTriangle: Component;
  export const ArrowBack: Component;
  export const ArrowForwardUp: Component;
  export const ArrowLeft: Component;
  export const ArrowRight: Component;
  export const ArrowsLeftRight: Component;
  export const ArrowsRightLeft: Component;
  export const ArrowsShuffle: Component;
  export const Artboard: Component;
  export const Binary: Component;
  export const Blockquote: Component;
  export const Bold: Component;
  export const Braces: Component;
  export const BrandDocker: Component;
  export const BrandGit: Component;
  export const Browser: Component;
  export const Bug: Component;
  export const BuildingFactory: Component;
  export const BuildingSkyscraper: Component;
  export const Calendar: Component;
  export const Camera: Component;
  export const Certificate: Component;
  export const Check: Component;
  export const ClearFormatting: Component;
  export const ClipboardList: Component;
  export const Code: Component;
  export const CodePlus: Component;
  export const Copy: Component;
  export const Cpu: Component;
  export const Database: Component;
  export const DeviceDesktop: Component;
  export const DeviceMobile: Component;
  export const Devices: Component;
  export const Edit: Component;
  export const Engine: Component;
  export const Exchange: Component;
  export const ExternalLink: Component;
  export const EyeOff: Component;
  export const FileDiff: Component;
  export const FileCode: Component;
  export const FileDigit: Component;
  export const FileInvoice: Component;
  export const FileText: Component;
  export const Fingerprint: Component;
  export const H1: Component;
  export const H2: Component;
  export const H3: Component;
  export const H4: Component;
  export const Home2: Component;
  export const Hourglass: Component;
  export const Italic: Component;
  export const Key: Component;
  export const Keyboard: Component;
  export const Language: Component;
  export const LetterCaseToggle: Component;
  export const LetterX: Component;
  export const Link: Component;
  export const List: Component;
  export const ListNumbers: Component;
  export const Loader: Component;
  export const Lock: Component;
  export const LockSquare: Component;
  export const Mail: Component;
  export const Mailbox: Component;
  export const MailOpened: Component;
  export const Markdown: Component;
  export const Math: Component;
  export const Menu2: Component;
  export const MoodSmile: Component;
  export const Palette: Component;
  export const Percentage: Component;
  export const Phone: Component;
  export const Plus: Component;
  export const Qrcode: Component;
  export const Refresh: Component;
  export const Router: Component;
  export const Search: Component;
  export const Server: Component;
  export const Shield: Component;
  export const ShieldCheck: Component;
  export const SortDescendingNumbers: Component;
  export const Speakerphone: Component;
  export const Strikethrough: Component;
  export const Tags: Component;
  export const Temperature: Component;
  export const Terminal2: Component;
  export const TextWrap: Component;
  export const Trash: Component;
  export const Unlink: Component;
  export const Url: Component;
  export const World: Component;
  export const X: Component;
}

declare module 'figue' {
  export function figue(schema: Record<string, any>): {
    loadEnv: (env: Record<string, any>) => ReturnType<typeof figue>
    validate: () => ReturnType<typeof figue>
    getConfig: () => any
  };
}

declare module 'naive-ui' {
  import type { DefineComponent } from 'vue';

  export const darkTheme: any;
  export const lightTheme: any;
  export const zhCN: any;
  export const enUS: any;
  export type GlobalThemeOverrides = Record<string, any>;
  export function useMessage(): any;
  export function useNotification(): any;
  export function useDialog(): any;
  export function useLoadingBar(): any;
  export function useThemeVars(): any;
  const _components: Record<string, DefineComponent<any, any, any>>;
  export const NConfigProvider: DefineComponent<any, any, any>;
  export const NGlobalStyle: DefineComponent<any, any, any>;
  export const NMessageProvider: DefineComponent<any, any, any>;
  export const NNotificationProvider: DefineComponent<any, any, any>;
  export const NDialogProvider: DefineComponent<any, any, any>;
  export const NLoadingBarProvider: DefineComponent<any, any, any>;
  export const NLayout: DefineComponent<any, any, any>;
  export const NLayoutHeader: DefineComponent<any, any, any>;
  export const NLayoutSider: DefineComponent<any, any, any>;
  export const NLayoutContent: DefineComponent<any, any, any>;
  export const NButton: DefineComponent<any, any, any>;
  export const NIcon: DefineComponent<any, any, any>;
  export const NInput: DefineComponent<any, any, any>;
  export const NSelect: DefineComponent<any, any, any>;
  export const NSpace: DefineComponent<any, any, any>;
  export const NCard: DefineComponent<any, any, any>;
  export const NModal: DefineComponent<any, any, any>;
  export const NTooltip: DefineComponent<any, any, any>;
  export const NTag: DefineComponent<any, any, any>;
  export const NSpin: DefineComponent<any, any, any>;
  export const NSwitch: DefineComponent<any, any, any>;
  export const NCheckbox: DefineComponent<any, any, any>;
  export const NRadio: DefineComponent<any, any, any>;
  export const NSlider: DefineComponent<any, any, any>;
  export const NAlert: DefineComponent<any, any, any>;
  export const NBadge: DefineComponent<any, any, any>;
  export const NDivider: DefineComponent<any, any, any>;
  export const NText: DefineComponent<any, any, any>;
  export const NH1: DefineComponent<any, any, any>;
  export const NH2: DefineComponent<any, any, any>;
  export const NH3: DefineComponent<any, any, any>;
  export const NTable: DefineComponent<any, any, any>;
  export const NScrollbar: DefineComponent<any, any, any>;
  export const NPopover: DefineComponent<any, any, any>;
  export const NDropdown: DefineComponent<any, any, any>;
  export const NMenu: DefineComponent<any, any, any>;
  export const NTabs: DefineComponent<any, any, any>;
  export const NTabPane: DefineComponent<any, any, any>;
  export const NForm: DefineComponent<any, any, any>;
  export const NFormItem: DefineComponent<any, any, any>;
  export const NCollapse: DefineComponent<any, any, any>;
  export const NCollapseItem: DefineComponent<any, any, any>;
  export const NUpload: DefineComponent<any, any, any>;
  export const NCode: DefineComponent<any, any, any>;
  export const NInputNumber: DefineComponent<any, any, any>;
  export const NColorPicker: DefineComponent<any, any, any>;
  export const NDatePicker: DefineComponent<any, any, any>;
  export const NTimePicker: DefineComponent<any, any, any>;
  export const NGrid: DefineComponent<any, any, any>;
  export const NGridItem: DefineComponent<any, any, any>;
  export const NList: DefineComponent<any, any, any>;
  export const NListItem: DefineComponent<any, any, any>;
  export const NStatistic: DefineComponent<any, any, any>;
  export const NProgress: DefineComponent<any, any, any>;
  export const NResult: DefineComponent<any, any, any>;
  export const NEmpty: DefineComponent<any, any, any>;
  export const NImage: DefineComponent<any, any, any>;
  export const NAvatar: DefineComponent<any, any, any>;
  export const NThing: DefineComponent<any, any, any>;
  export const NPagination: DefineComponent<any, any, any>;
  export const NDescriptions: DefineComponent<any, any, any>;
  export const NDescriptionsItem: DefineComponent<any, any, any>;
  export const NDataTable: DefineComponent<any, any, any>;
  export const NAutoComplete: DefineComponent<any, any, any>;
  export const NCascader: DefineComponent<any, any, any>;
  export const NMention: DefineComponent<any, any, any>;
  export const NTransfer: DefineComponent<any, any, any>;
  export const NTree: DefineComponent<any, any, any>;
  export const NVirtualList: DefineComponent<any, any, any>;
  export const NDrawer: DefineComponent<any, any, any>;
  export const NDrawerContent: DefineComponent<any, any, any>;
  export const NPopconfirm: DefineComponent<any, any, any>;
  export const NPopselect: DefineComponent<any, any, any>;
  export const NSteps: DefineComponent<any, any, any>;
  export const NStep: DefineComponent<any, any, any>;
  export const NTimeline: DefineComponent<any, any, any>;
  export const NTimelineItem: DefineComponent<any, any, any>;
  export const NEllipsis: DefineComponent<any, any, any>;
  export const NAnchor: DefineComponent<any, any, any>;
  export const NAnchorLink: DefineComponent<any, any, any>;
  export const NBreadcrumb: DefineComponent<any, any, any>;
  export const NBreadcrumbItem: DefineComponent<any, any, any>;
  export const NBackTop: DefineComponent<any, any, any>;
  export const NGradientText: DefineComponent<any, any, any>;
  export const NNumberAnimation: DefineComponent<any, any, any>;
  export const NCountdown: DefineComponent<any, any, any>;
  export const NWatermark: DefineComponent<any, any, any>;
  export const NRow: DefineComponent<any, any, any>;
  export const NCol: DefineComponent<any, any, any>;
  export const NFlex: DefineComponent<any, any, any>;
  export const NElement: DefineComponent<any, any, any>;
  export const NInputGroup: DefineComponent<any, any, any>;
  export const NInputGroupLabel: DefineComponent<any, any, any>;
  export const NRadioGroup: DefineComponent<any, any, any>;
  export const NCheckboxGroup: DefineComponent<any, any, any>;
  export const NButtonGroup: DefineComponent<any, any, any>;
  export const NIconWrapper: DefineComponent<any, any, any>;
}

declare module '@tabler/icons-vue' {
  import type { Component } from 'vue';

  export const IconBrandGithub: Component;
  export const IconBrandX: Component;
  export const IconInfoCircle: Component;
  export const IconMoon: Component;
  export const IconSun: Component;
  export const IconSettings: Component;
  export const IconSearch: Component;
  export const IconX: Component;
  export const IconChevronRight: Component;
  export const IconChevronDown: Component;
  export const IconChevronUp: Component;
  export const IconCheck: Component;
  export const IconCopy: Component;
  export const IconTrash: Component;
  export const IconPlus: Component;
  export const IconMinus: Component;
  export const IconEdit: Component;
  export const IconExternalLink: Component;
  export const IconDownload: Component;
  export const IconUpload: Component;
  export const IconRefresh: Component;
  export const IconStar: Component;
  export const IconStarFilled: Component;
  export const IconHome: Component;
  export const IconMenu2: Component;
  export const IconArrowLeft: Component;
  export const IconArrowRight: Component;
  export const IconHeart: Component;
  export const IconHeartFilled: Component;
  export const IconAlertCircle: Component;
  export const IconInfoCircle: Component;
  export const IconCircleCheck: Component;
  export const IconLock: Component;
  export const IconLockOpen: Component;
  export const IconEye: Component;
  export const IconEyeOff: Component;
  const _default: any;
  export default _default;
}

declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const Component: ComponentOptions;
  export default Component;
}

declare module '*.md' {
  import type { ComponentOptions } from 'vue';

  const Component: ComponentOptions;
  export default Component;
}

declare module 'iarna-toml-esm' {
  export const parse: (toml: string) => any;
  export const stringify: (obj: any) => string;
}

declare module 'emojilib' {
  const lib: Record<string, string[]>;
  export default lib;
}

declare module 'unicode-emoji-json' {
  const emoji: Record<string, {
    name: string
    slug: string
    group: string
    emoji_version: string
    unicode_version: string
    skin_tone_support: boolean
    skin_tone_support_unicode_version: string
  }>;

  export default emoji;
}

declare module 'pdf-signature-reader' {
  const verifySignature: (pdf: ArrayBuffer) => ({ signatures: SignatureInfo[] });

  export default verifySignature;
}

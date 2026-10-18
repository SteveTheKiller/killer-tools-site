export interface QrCode {
  text: string
  version: number
  errorCorrection: string
  corners: { x: number, y: number }[]
  link: { disposition: 'Allowed' | 'Warning' | 'Blocked' | 'DisplayOnly', url: string | null, warnings: string[] }
  wifiPassword: string | null
}

export interface ReadRequest {
  gray: ArrayBuffer
  width: number
  height: number
  runtimeBase: string
}

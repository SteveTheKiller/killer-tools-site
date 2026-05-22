export interface DeveloperDilution {
  label: string
  devParts: number
  waterParts: number
}

export interface FilmEntry {
  name: string
  isoBase: number
  // base times in seconds at baseTemp, default dilution per developer, box speed
  // null = no reliable data available
  times: Record<string, number | null>
  // reference temperature for times (default 20°C for B&W, 38°C for C41/E6)
  baseTemp?: number
  // process type label for display
  process?: string
}

export interface DeveloperEntry {
  id: string
  name: string
  dilutions: DeveloperDilution[]
  defaultDilution: number
}

// ---- Developers ----
export const developers: DeveloperEntry[] = [
  {
    id: 'c41',
    name: 'C41 (color negative)',
    dilutions: [
      { label: 'Kit mix', devParts: 1, waterParts: 0 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'e6',
    name: 'E6 (slide / reversal)',
    dilutions: [
      { label: 'Kit mix', devParts: 1, waterParts: 0 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'd76',
    name: 'D-76',
    dilutions: [
      { label: 'Stock', devParts: 1, waterParts: 0 },
      { label: '1+1', devParts: 1, waterParts: 1 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'id11',
    name: 'ID-11',
    dilutions: [
      { label: 'Stock', devParts: 1, waterParts: 0 },
      { label: '1+1', devParts: 1, waterParts: 1 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'hc110',
    name: 'HC-110',
    dilutions: [
      { label: 'Dil. B (1+31)', devParts: 1, waterParts: 31 },
      { label: 'Dil. H (1+63)', devParts: 1, waterParts: 63 },
      { label: 'Dil. A (1+15)', devParts: 1, waterParts: 15 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'rodinal',
    name: 'Rodinal / R09',
    dilutions: [
      { label: '1+25', devParts: 1, waterParts: 25 },
      { label: '1+50', devParts: 1, waterParts: 50 },
      { label: '1+100', devParts: 1, waterParts: 100 },
    ],
    defaultDilution: 1,
  },
  {
    id: 'xtol',
    name: 'XTOL',
    dilutions: [
      { label: 'Stock', devParts: 1, waterParts: 0 },
      { label: '1+1', devParts: 1, waterParts: 1 },
      { label: '1+2', devParts: 1, waterParts: 2 },
      { label: '1+3', devParts: 1, waterParts: 3 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'ddx',
    name: 'DDX',
    dilutions: [
      { label: '1+4', devParts: 1, waterParts: 4 },
      { label: '1+9', devParts: 1, waterParts: 9 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'ilfosol3',
    name: 'Ilfosol 3',
    dilutions: [
      { label: '1+9', devParts: 1, waterParts: 9 },
      { label: '1+14', devParts: 1, waterParts: 14 },
    ],
    defaultDilution: 0,
  },
  {
    id: 'microphen',
    name: 'Microphen',
    dilutions: [
      { label: 'Stock', devParts: 1, waterParts: 0 },
      { label: '1+1', devParts: 1, waterParts: 1 },
      { label: '1+3', devParts: 1, waterParts: 3 },
    ],
    defaultDilution: 0,
  },
];

// ---- Film stocks ----
// Times are in seconds at 20°C at box ISO, default dilution per developer.
// Source: Massive Dev Chart and manufacturer datasheets. Approximations only.
// null = no reliable data.
export const filmStocks: FilmEntry[] = [

  // ===== ILFORD =====
  {
    name: 'Ilford HP5 Plus',
    isoBase: 400,
    times: {
      d76: 390, // 6.5 min Stock
      id11: 390,
      hc110: 480, // 8 min Dil B
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 480, // 8 min 1+4
      ilfosol3: 480, // 8 min 1+9
      microphen: 330, // 5.5 min Stock
    },
  },
  {
    name: 'Ilford FP4 Plus',
    isoBase: 125,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 480, // 8 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: 480, // 8 min 1+9
      microphen: 270, // 4.5 min Stock
    },
  },
  {
    name: 'Ilford Delta 100',
    isoBase: 100,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: 450, // 7.5 min Dil B
      rodinal: 900, // 15 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 480, // 8 min 1+4
      ilfosol3: 480, // 8 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Ilford Delta 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 480, // 8 min Dil B
      rodinal: null,
      xtol: 360, // 6 min Stock
      ddx: 480, // 8 min 1+4
      ilfosol3: 480, // 8 min 1+9
      microphen: 330, // 5.5 min Stock
    },
  },
  {
    name: 'Ilford Delta 3200',
    isoBase: 3200,
    times: {
      d76: 600, // 10 min Stock
      id11: 600,
      hc110: null,
      rodinal: null,
      xtol: 480, // 8 min Stock
      ddx: 600, // 10 min 1+4
      ilfosol3: 600, // 10 min 1+9
      microphen: 480, // 8 min Stock
    },
  },
  {
    name: 'Ilford Pan F Plus',
    isoBase: 50,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: 450, // 7.5 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 390, // 6.5 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Ilford SFX 200',
    isoBase: 200,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 390, // 6.5 min Dil B
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Ilford Ortho Plus 80',
    isoBase: 80,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: 300, // 5 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: 360, // 6 min 1+9
      microphen: null,
    },
  },

  // ===== KENTMERE =====
  {
    name: 'Kentmere 100',
    isoBase: 100,
    times: {
      d76: 450, // 7.5 min Stock
      id11: 450,
      hc110: 420, // 7 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: 450, // 7.5 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Kentmere 400',
    isoBase: 400,
    times: {
      d76: 390, // 6.5 min Stock
      id11: 390,
      hc110: 420, // 7 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },

  // ===== KODAK =====
  {
    name: 'Kodak Tri-X 400',
    isoBase: 400,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: 450, // 7.5 min Dil B
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 480, // 8 min 1+4
      ilfosol3: 480, // 8 min 1+9
      microphen: 420, // 7 min Stock
    },
  },
  {
    name: 'Kodak T-MAX 100',
    isoBase: 100,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: 390, // 6.5 min Dil B
      rodinal: 480, // 8 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: 480, // 8 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Kodak T-MAX 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 480, // 8 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: 480, // 8 min 1+9
      microphen: 330, // 5.5 min Stock
    },
  },
  {
    name: 'Kodak T-MAX P3200',
    isoBase: 3200,
    times: {
      d76: 600, // 10 min Stock
      id11: 600,
      hc110: null,
      rodinal: null,
      xtol: 480, // 8 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: 480, // 8 min Stock
    },
  },
  {
    name: 'Kodak Double-X 5222',
    isoBase: 250,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 330, // 5.5 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Kodak Plus-X 125',
    isoBase: 125,
    times: {
      d76: 390, // 6.5 min Stock (discontinued film, classic data)
      id11: 390,
      hc110: 360, // 6 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 270, // 4.5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== FUJIFILM =====
  {
    name: 'Fujifilm Neopan Acros II',
    isoBase: 100,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: 300, // 5 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 390, // 6.5 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Fujifilm Neopan 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock (discontinued)
      id11: 420,
      hc110: 420, // 7 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Fujifilm Neopan 1600',
    isoBase: 1600,
    times: {
      d76: 540, // 9 min Stock (discontinued)
      id11: 540,
      hc110: null,
      rodinal: null,
      xtol: 420, // 7 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: 420, // 7 min Stock
    },
  },

  // ===== FOMAPAN =====
  {
    name: 'Fomapan 100',
    isoBase: 100,
    times: {
      d76: 450, // 7.5 min Stock
      id11: 450,
      hc110: 360, // 6 min Dil B
      rodinal: 540, // 9 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 360, // 6 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Fomapan 200',
    isoBase: 200,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 360, // 6 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Fomapan 400',
    isoBase: 400,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: 330, // 5.5 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 360, // 6 min 1+4
      ilfosol3: 390, // 6.5 min 1+9
      microphen: null,
    },
  },

  // ===== ROLLEI =====
  {
    name: 'Rollei RPX 25',
    isoBase: 25,
    times: {
      d76: 300, // 5 min Stock
      id11: 300,
      hc110: null,
      rodinal: 540, // 9 min 1+50
      xtol: 240, // 4 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Rollei RPX 100',
    isoBase: 100,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 390, // 6.5 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Rollei RPX 400',
    isoBase: 400,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: 360, // 6 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Rollei Retro 80S',
    isoBase: 80,
    times: {
      d76: 330, // 5.5 min Stock
      id11: 330,
      hc110: null,
      rodinal: 600, // 10 min 1+50
      xtol: 270, // 4.5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Rollei Retro 400S',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: null,
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Rollei Infrared 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: null,
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Rollei Superpan 200',
    isoBase: 200,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: null,
      rodinal: 720, // 12 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== ADOX =====
  {
    name: 'Adox Pan 25',
    isoBase: 25,
    times: {
      d76: 360, // 6 min Stock
      id11: 360,
      hc110: null,
      rodinal: 600, // 10 min 1+50
      xtol: 240, // 4 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Adox Silvermax 100',
    isoBase: 100,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: null,
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Adox HR-50',
    isoBase: 50,
    times: {
      d76: 300, // 5 min Stock
      id11: 300,
      hc110: null,
      rodinal: 600, // 10 min 1+50
      xtol: 240, // 4 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Adox CMS 20 II',
    isoBase: 20,
    times: {
      d76: null, // really needs Adotech developer
      id11: null,
      hc110: null,
      rodinal: 840, // 14 min 1+50 (low contrast result)
      xtol: 600, // 10 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== BERGGER =====
  {
    name: 'Bergger Pancro 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 360, // 6 min Stock
      ddx: 420, // 7 min 1+4
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== CINESTILL / KODAK CINEMA =====
  {
    name: 'CineStill BwXX',
    isoBase: 250,
    times: {
      d76: 420, // 7 min Stock (Kodak Double-X base)
      id11: 420,
      hc110: 330, // 5.5 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== LOMOGRAPHY =====
  {
    name: 'Lomography Lady Grey 400',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 420, // 7 min Dil B
      rodinal: 720, // 12 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: 420, // 7 min 1+9
      microphen: null,
    },
  },
  {
    name: 'Lomography Berlin Kino 400',
    isoBase: 400,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: 420, // 7 min Dil B
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Lomography Earl Grey 100',
    isoBase: 100,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== SHANGHAI =====
  {
    name: 'Shanghai GP3 100',
    isoBase: 100,
    times: {
      d76: 450, // 7.5 min Stock
      id11: 450,
      hc110: 360, // 6 min Dil B
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== ORWO =====
  {
    name: 'ORWO UN54',
    isoBase: 100,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: null,
      rodinal: 660, // 11 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'ORWO N74 Plus',
    isoBase: 400,
    times: {
      d76: 420, // 7 min Stock
      id11: 420,
      hc110: null,
      rodinal: 720, // 12 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== ARISTA / FREESTYLE =====
  {
    name: 'Arista EDU Ultra 100',
    isoBase: 100,
    times: {
      d76: 420, // 7 min Stock (Fomapan 100 base)
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 540, // 9 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Arista EDU Ultra 200',
    isoBase: 200,
    times: {
      d76: 420, // 7 min Stock (Fomapan 200 base)
      id11: 420,
      hc110: 360, // 6 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Arista EDU Ultra 400',
    isoBase: 400,
    times: {
      d76: 360, // 6 min Stock (Fomapan 400 base)
      id11: 360,
      hc110: 330, // 5.5 min Dil B
      rodinal: 600, // 10 min 1+50
      xtol: 300, // 5 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },
  {
    name: 'Arista Premium 400',
    isoBase: 400,
    times: {
      d76: 480, // 8 min Stock (HP5 Plus base)
      id11: 480,
      hc110: 480, // 8 min Dil B
      rodinal: 780, // 13 min 1+50
      xtol: 360, // 6 min Stock
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== LUCKY =====
  {
    name: 'Lucky SHD 100',
    isoBase: 100,
    times: {
      d76: 450, // 7.5 min Stock
      id11: 450,
      hc110: null,
      rodinal: 660, // 11 min 1+50
      xtol: null,
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== SVEMA =====
  {
    name: 'Svema Foto 100',
    isoBase: 100,
    times: {
      d76: 480, // 8 min Stock
      id11: 480,
      hc110: null,
      rodinal: 720, // 12 min 1+50
      xtol: null,
      ddx: null,
      ilfosol3: null,
      microphen: null,
    },
  },

  // ===== COLOR NEGATIVE (C41) =====
  // All times at 38°C standard. Push/pull adds ~45s per stop.
  {
    name: 'Kodak Portra 160',
    isoBase: 160,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Portra 400',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Portra 800',
    isoBase: 800,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Ektar 100',
    isoBase: 100,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Gold 200',
    isoBase: 200,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak UltraMax 400',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak ColorPlus 200',
    isoBase: 200,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Pro 400H',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Superia 200',
    isoBase: 200,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Superia 400',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Superia X-TRA 400',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'CineStill 400D',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'CineStill 800T',
    isoBase: 800,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Lomography Color 100',
    isoBase: 100,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Lomography Color 400',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Vision3 50D 5203',
    isoBase: 50,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Vision3 250D 5207',
    isoBase: 250,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Vision3 500T 5219',
    isoBase: 500,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  // C41-processed B&W
  {
    name: 'Ilford XP2 Super',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak BW400CN',
    isoBase: 400,
    baseTemp: 38,
    process: 'C41',
    times: { c41: 195, e6: null, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },

  // ===== SLIDE / E6 =====
  // First developer time at 38°C. E6 is very temperature sensitive.
  {
    name: 'Fujifilm Velvia 50',
    isoBase: 50,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Velvia 100',
    isoBase: 100,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Provia 100F',
    isoBase: 100,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Fujifilm Astia 100F',
    isoBase: 100,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Kodak Ektachrome E100',
    isoBase: 100,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'Lomography Chrome 100',
    isoBase: 100,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
  {
    name: 'CineStill CS41 Xpro 50D',
    isoBase: 50,
    baseTemp: 38,
    process: 'E6',
    times: { c41: null, e6: 360, d76: null, id11: null, hc110: null, rodinal: null, xtol: null, ddx: null, ilfosol3: null, microphen: null },
  },
];

// Common tank volume presets (ml)
export const tankVolumes = [270, 500, 600, 1000];

// Push/pull stops range
export const pushPullStops = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

// Temperature range (°C) - covers both B&W (around 20) and C41/E6 (around 38)
export const tempMin = 10;
export const tempMax = 42;

/**
 * Temperature compensation using Q10 approximation.
 * t2 = t1 * 2^((baseTemp - T) / 10)
 * baseTemp defaults to 20°C for B&W, 38°C for C41/E6.
 */
export function tempAdjust(baseSeconds: number, tempC: number, baseTemp = 20): number {
  return baseSeconds * 2 ** ((baseTemp - tempC) / 10);
}

/**
 * Push/pull timing adjustment.
 * stops > 0 = push (more time), stops < 0 = pull (less time).
 */
export function pushPullAdjust(seconds: number, stops: number): number {
  return seconds * 1.4 ** stops;
}

/**
 * Format seconds as Xm Ys string.
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) {
    return `${s}s`;
  }
  if (s === 0) {
    return `${m}m`;
  }
  return `${m}m ${s}s`;
}

/**
 * Dilution volumes given total tank volume and a DeveloperDilution.
 */
export function calcDilutionVolumes(totalMl: number, dil: DeveloperDilution): { devMl: number, waterMl: number } {
  if (dil.waterParts === 0) {
    return { devMl: totalMl, waterMl: 0 };
  }
  const total = dil.devParts + dil.waterParts;
  const devMl = Math.round((totalMl * dil.devParts) / total);
  return { devMl, waterMl: totalMl - devMl };
}

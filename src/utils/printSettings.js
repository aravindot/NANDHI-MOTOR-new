export const PRINT_STYLE_OPTIONS = [
  {
    id: 'classic',
    label: 'Classic Formal',
    tagline: 'Traditional Dealership Standard',
    description: 'Formal dual-bordered layout with structured grid panels, double-rule ledger summary, and traditional authorization seal.',
    features: ['Dual-line header framing', 'Boxed two-column particulars', 'Double-ruled accounting footer', 'Official dealership seal stamp'],
    badge: 'Dealership Standard'
  },
  {
    id: 'minimal',
    label: 'Modern Minimal',
    tagline: 'Clean, Sleek & Ink-Efficient',
    description: 'Contemporary Scandinavian typographic layout with high whitespace, borderless item rows, and lightweight modern totals.',
    features: ['Ink-saving borderless styling', 'Crisp left-aligned typography', 'Subtle pill status badges', 'Airy modern totals stack'],
    badge: 'Clean & Paper-Saving'
  },
  {
    id: 'premium',
    label: 'Executive Premium',
    tagline: 'Branded Luxury Showroom Edition',
    description: 'High-contrast luxury branded header ribbon, rounded accent cards, tinted zebra item rows, and dark executive grand total capsule.',
    features: ['Branded gradient header ribbon', 'Accent-bordered identity cards', 'Executive dark grand total capsule', 'Verification seal badge'],
    badge: 'Luxury Showroom'
  }
];

export const PRINT_COLOR_OPTIONS = [
  { id: 'green', label: 'Emerald Green', value: '#059669', accent: '#10b981', soft: '#ecfdf5' },
  { id: 'blue', label: 'Royal Blue', value: '#2563eb', accent: '#60a5fa', soft: '#eff6ff' },
  { id: 'black', label: 'Obsidian Black', value: '#111827', accent: '#374151', soft: '#f3f4f6' }
];

export const PRINT_DOCUMENT_TYPES = [
  { id: 'invoice', label: 'Tax Invoice' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'booking', label: 'Booking Slip' },
  { id: 'jobsheet', label: 'Job Card' },
  { id: 'servicebill', label: 'Service Bill' },
  { id: 'purchase', label: 'Purchase Voucher' },
  { id: 'warranty', label: 'Warranty Claim' }
];

export const DEFAULT_PRINT_SETTINGS = {
  style: 'classic',
  color: 'green',
  presets: Object.fromEntries(PRINT_DOCUMENT_TYPES.map(type => [type.id, { style: 'classic', color: 'green' }]))
};

export const normalizePrintSettings = (settings = {}) => {
  const style = PRINT_STYLE_OPTIONS.some(option => option.id === settings.style) ? settings.style : DEFAULT_PRINT_SETTINGS.style;
  const color = PRINT_COLOR_OPTIONS.some(option => option.id === settings.color) ? settings.color : DEFAULT_PRINT_SETTINGS.color;
  const presets = Object.fromEntries(
    PRINT_DOCUMENT_TYPES.map(type => {
      const preset = settings?.presets?.[type.id] || {};
      return [type.id, {
        style: PRINT_STYLE_OPTIONS.some(option => option.id === preset.style) ? preset.style : DEFAULT_PRINT_SETTINGS.style,
        color: PRINT_COLOR_OPTIONS.some(option => option.id === preset.color) ? preset.color : DEFAULT_PRINT_SETTINGS.color
      }];
    })
  );

  return { style, color, presets };
};

export const getEffectivePrintSettings = (settings = {}, documentType = 'default') => {
  const normalized = normalizePrintSettings(settings);
  return {
    style: normalized.style,
    color: normalized.color
  };
};

export const getPrintTheme = (settings = {}, documentType = 'default') => {
  const effective = getEffectivePrintSettings(settings, documentType);
  const selectedColor = PRINT_COLOR_OPTIONS.find(option => option.id === effective.color) || PRINT_COLOR_OPTIONS[0];

  const palette = {
    classic: {
      primary: selectedColor.value,
      secondary: '#111827',
      tertiary: '#f3f4f6',
      highlight: selectedColor.soft
    },
    minimal: {
      primary: selectedColor.value,
      secondary: '#374151',
      tertiary: '#f9fafb',
      highlight: '#f3f4f6'
    },
    premium: {
      primary: selectedColor.value,
      secondary: '#111827',
      tertiary: '#f5f3ff',
      highlight: selectedColor.soft
    }
  };

  const selectedPalette = palette[effective.style] || palette.classic;

  return {
    ...effective,
    primary: selectedPalette.primary,
    secondary: selectedPalette.secondary,
    tertiary: selectedPalette.tertiary,
    highlight: selectedPalette.highlight,
    accent: selectedColor.accent,
    colorLabel: selectedColor.label,
    value: selectedColor.value,
    soft: selectedColor.soft
  };
};

export const buildPrintThemeCss = (settings = DEFAULT_PRINT_SETTINGS, documentType = 'default') => {
  const theme = getPrintTheme(settings, documentType);

  return `
    :root {
      --print-primary: ${theme.primary};
      --print-secondary: ${theme.secondary};
      --print-tertiary: ${theme.tertiary};
      --print-highlight: ${theme.highlight};
      --print-accent: ${theme.accent};
      --print-color: ${theme.value};
      --print-soft: ${theme.soft};
    }

    @page {
      size: A4;
      margin: 10mm;
    }

    /* Common Surface Styles */
    .print-theme-surface, .doc-paper {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
    }

    /* ==========================================================================
       LAYOUT 1: CLASSIC FORMAL (Traditional Dealership Standard)
       ========================================================================== */
    .print-style-classic .doc-header-banner {
      text-align: center !important;
      border-bottom: 3px double #111827 !important;
      padding-bottom: 14px !important;
      margin-bottom: 18px !important;
      background: transparent !important;
    }
    .print-style-classic .doc-header-banner h1 {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-size: 24px !important;
      font-weight: 800 !important;
      letter-spacing: 0.5px !important;
      color: var(--print-primary, #059669) !important;
      text-transform: uppercase !important;
      margin: 0 !important;
    }
    .print-style-classic .doc-header-banner p {
      color: #4b5563 !important;
      font-size: 12px !important;
      margin: 2px 0 0 !important;
    }
    .print-style-classic .doc-badge-title {
      display: inline-block !important;
      margin-top: 10px !important;
      border: 1.5px solid #111827 !important;
      background: #f3f4f6 !important;
      color: #111827 !important;
      padding: 4px 18px !important;
      font-weight: 800 !important;
      font-size: 11px !important;
      letter-spacing: 1.5px !important;
      border-radius: 2px !important;
      text-transform: uppercase !important;
    }
    .print-style-classic .doc-grid-2 {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 16px !important;
      margin-bottom: 16px !important;
    }
    .print-style-classic .doc-grid-2 > div {
      border: 1.5px solid #1f2937 !important;
      border-radius: 2px !important;
      background-color: #ffffff !important;
      padding: 10px 14px !important;
    }
    .print-style-classic .doc-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      font-size: 12px !important;
    }
    .print-style-classic .doc-table th {
      background-color: #f3f4f6 !important;
      border-top: 2px solid #111827 !important;
      border-bottom: 2px solid #111827 !important;
      color: #111827 !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      padding: 8px !important;
    }
    .print-style-classic .doc-table td {
      padding: 8px !important;
      border-bottom: 1px solid #d1d5db !important;
    }
    .print-style-classic .doc-total-box {
      border: 1.5px solid #111827 !important;
      border-top: 2px solid #111827 !important;
      border-bottom: 3px double #111827 !important;
      background: #f9fafb !important;
      padding: 10px 16px !important;
      border-radius: 2px !important;
    }
    .print-style-classic .doc-sig-line {
      border-top: 1.5px solid #111827 !important;
      width: 180px !important;
      text-align: center !important;
      padding-top: 6px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
    }

    /* ==========================================================================
       LAYOUT 2: MODERN MINIMAL (Clean, Sleek & Ink-Efficient)
       ========================================================================== */
    .print-style-minimal .doc-header-banner {
      text-align: left !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding-bottom: 18px !important;
      margin-bottom: 20px !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-end !important;
      flex-wrap: wrap !important;
      gap: 12px !important;
      background: transparent !important;
    }
    .print-style-minimal .doc-header-banner h1 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 24px !important;
      font-weight: 700 !important;
      letter-spacing: -0.5px !important;
      color: #111827 !important;
      margin: 0 !important;
    }
    .print-style-minimal .doc-header-banner p {
      color: #6b7280 !important;
      font-size: 12px !important;
      margin: 2px 0 0 !important;
    }
    .print-style-minimal .doc-badge-title {
      display: inline-block !important;
      background: transparent !important;
      color: var(--print-primary, #059669) !important;
      border: 1px solid var(--print-primary, #059669) !important;
      padding: 3px 12px !important;
      font-weight: 700 !important;
      font-size: 11px !important;
      letter-spacing: 0.5px !important;
      border-radius: 999px !important;
      text-transform: uppercase !important;
    }
    .print-style-minimal .doc-grid-2 {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 20px !important;
      margin-bottom: 20px !important;
    }
    .print-style-minimal .doc-grid-2 > div {
      border: none !important;
      background: transparent !important;
      padding: 4px 0 !important;
      box-shadow: none !important;
    }
    .print-style-minimal .doc-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      font-size: 12px !important;
    }
    .print-style-minimal .doc-table th {
      background: transparent !important;
      border-top: 1px solid #111827 !important;
      border-bottom: 1px solid #111827 !important;
      color: #374151 !important;
      font-weight: 600 !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      padding: 8px !important;
    }
    .print-style-minimal .doc-table td {
      border-bottom: 1px solid #f3f4f6 !important;
      padding: 10px 8px !important;
    }
    .print-style-minimal .doc-total-box {
      border: none !important;
      border-top: 1px solid #e5e7eb !important;
      background: transparent !important;
      padding: 12px 0 0 0 !important;
    }
    .print-style-minimal .doc-sig-line {
      border-top: 1px solid #e5e7eb !important;
      width: 180px !important;
      text-align: center !important;
      padding-top: 6px !important;
      font-size: 11px !important;
      color: #6b7280 !important;
      font-weight: 600 !important;
    }

    /* ==========================================================================
       LAYOUT 3: EXECUTIVE PREMIUM (Luxury Branded Showroom Edition)
       ========================================================================== */
    .print-style-premium .doc-header-banner {
      background: linear-gradient(135deg, var(--print-primary, #059669), var(--print-secondary, #111827)) !important;
      color: #ffffff !important;
      padding: 22px 26px !important;
      border-radius: 12px !important;
      margin-bottom: 22px !important;
      border-bottom: none !important;
      text-align: left !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
    }
    .print-style-premium .doc-header-banner h1 {
      color: #ffffff !important;
      font-size: 25px !important;
      font-weight: 900 !important;
      letter-spacing: -0.3px !important;
      margin: 0 !important;
    }
    .print-style-premium .doc-header-banner p {
      color: rgba(255,255,255,0.9) !important;
      margin: 3px 0 0 !important;
      font-size: 12px !important;
    }
    .print-style-premium .doc-badge-title {
      display: inline-block !important;
      background: rgba(255, 255, 255, 0.22) !important;
      color: #ffffff !important;
      backdrop-filter: blur(4px) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      padding: 6px 18px !important;
      font-weight: 800 !important;
      font-size: 12px !important;
      letter-spacing: 1px !important;
      border-radius: 20px !important;
      text-transform: uppercase !important;
    }
    .print-style-premium .doc-grid-2 {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 16px !important;
      margin-bottom: 18px !important;
    }
    .print-style-premium .doc-grid-2 > div {
      border: 1px solid #e5e7eb !important;
      border-left: 4px solid var(--print-primary, #059669) !important;
      border-radius: 10px !important;
      background: #ffffff !important;
      padding: 14px 16px !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.04) !important;
    }
    .print-style-premium .doc-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 18px 0 !important;
      font-size: 12px !important;
    }
    .print-style-premium .doc-table th {
      background: linear-gradient(135deg, var(--print-primary, #059669), var(--print-secondary, #111827)) !important;
      color: #ffffff !important;
      border: none !important;
      font-weight: 700 !important;
      padding: 10px 10px !important;
      text-transform: uppercase !important;
      font-size: 11px !important;
      letter-spacing: 0.5px !important;
    }
    .print-style-premium .doc-table th:first-child {
      border-top-left-radius: 8px !important;
    }
    .print-style-premium .doc-table th:last-child {
      border-top-right-radius: 8px !important;
    }
    .print-style-premium .doc-table tbody tr:nth-child(even) td {
      background-color: var(--print-soft, #f0fdf4) !important;
    }
    .print-style-premium .doc-table td {
      padding: 10px 8px !important;
      border-bottom: 1px solid #e5e7eb !important;
    }
    .print-style-premium .doc-total-box {
      background: linear-gradient(135deg, #111827, #1f2937) !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      padding: 14px 20px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    .print-style-premium .doc-total-box * {
      color: #ffffff !important;
    }
    .print-style-premium .doc-sig-line {
      border-top: 2px solid var(--print-primary, #059669) !important;
      width: 190px !important;
      text-align: center !important;
      padding-top: 6px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #111827 !important;
    }

    /* Print Media Isolations */
    @media print {
      html, body {
        background: #ffffff !important;
        color: #111827 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .print-theme-surface, .doc-paper {
        border: none !important;
        padding: 0 !important;
        box-shadow: none !important;
      }
    }
  `;
};

export const readPrintSettingsFromStorage = () => {
  try {
    const saved = localStorage.getItem('nandhi_app_company_profile');
    const legacy = localStorage.getItem('nandhi_company_profile');
    const profile = saved ? JSON.parse(saved) : legacy ? JSON.parse(legacy) : null;
    if (profile && profile.printSettings) {
      return normalizePrintSettings(profile.printSettings);
    }
  } catch (error) {
    console.warn('Unable to read print settings from storage.', error);
  }

  return normalizePrintSettings(DEFAULT_PRINT_SETTINGS);
};

export const resolvePrintSettings = (settings, documentType = 'default') => {
  const safeSettings = settings && Object.keys(settings).length ? settings : readPrintSettingsFromStorage();
  return getEffectivePrintSettings(safeSettings, documentType);
};

export const applyPrintThemeToDocument = (settings = DEFAULT_PRINT_SETTINGS, documentType = 'default') => {
  if (typeof document === 'undefined') return;
  const normalized = normalizePrintSettings(settings);
  const styleTag = document.getElementById('nandhi-print-theme');
  const css = buildPrintThemeCss(normalized, documentType);

  if (styleTag) {
    styleTag.innerHTML = css;
    return;
  }

  const tag = document.createElement('style');
  tag.id = 'nandhi-print-theme';
  tag.setAttribute('data-print-theme', normalized.color);
  tag.innerHTML = css;
  document.head.appendChild(tag);
};

export const buildPrintWindowHtml = (title, bodyHtml, settings = DEFAULT_PRINT_SETTINGS, documentType = 'default') => {
  const theme = getPrintTheme(settings, documentType);
  const css = buildPrintThemeCss(settings, documentType);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>${css}</style>
      </head>
      <body class="print-style-${theme.style || 'classic'}">
        <div class="print-theme-surface print-style-${theme.style || 'classic'}" style="max-width: 900px; margin: 0 auto; padding: 24px;">
          ${bodyHtml}
        </div>
      </body>
    </html>
  `;
};

export const openThemePrintWindow = (title, bodyHtml, settings = DEFAULT_PRINT_SETTINGS, documentType = 'default') => {
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    window.print();
    return null;
  }

  const html = buildPrintWindowHtml(title, bodyHtml, settings, documentType);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
  return printWindow;
};


// Keys are camelCase, as the CSSOM spells them; a hyphenated key would be silently dropped.
export const applyStyle = (element, style) => {
  if (!element || !style) return;
  Object.entries(style).forEach(([property, value]) => {
    if (property.startsWith('--')) element.style.setProperty(property, value);
    else element.style[property] = value;
  });
};

// A string becomes a text node: Leaflet applies string content with innerHTML, and it is usually a
// record's field.
export const asNode = (content) =>
  content instanceof Node ? content : document.createTextNode(String(content));

// The revoke is deferred, since releasing the URL in the click's turn cancels the download in some
// browsers. CSV gets a BOM, or spreadsheets open it in a legacy code page.
export const download = (filename, content, type) => {
  const bom = type.startsWith('text/csv') ? '﻿' : '';
  const url = URL.createObjectURL(new Blob([bom, content], { type }));

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// The clipboard API needs a secure origin, so the textarea fallback stays. The textarea goes inside
// `container`, because a modal that traps focus takes it back from one on the body.
export const copyText = async (text, container = document.body) => {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Refused, as a browser may without saying why. The older way may still work.
    }
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  Object.assign(area.style, { position: 'fixed', top: '0', left: '0', opacity: '0' });
  container.appendChild(area);
  area.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
};

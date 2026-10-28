import { popupFor } from '../../appearance/descriptor';
import { applyStyle, asNode } from '../dom';

// Styled as it is built: unlike a label's pill, this element is ours and Leaflet only appends it.
export const popupElement = ({ title, rows }, spec = {}) => {
  const root = document.createElement('div');
  root.className = ['atlas-popup', spec.className].filter(Boolean).join(' ');
  applyStyle(root, spec.style);

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'atlas-popup-title';
    heading.textContent = title;
    applyStyle(heading, spec.titleStyle);
    root.appendChild(heading);
  }

  if (rows.length) {
    const fields = document.createElement('dl');
    fields.className = 'atlas-popup-fields';
    rows.forEach(({ label, value }) => {
      const term = document.createElement('dt');
      term.textContent = label;
      applyStyle(term, spec.labelStyle);

      const detail = document.createElement('dd');
      detail.textContent = value;
      applyStyle(detail, spec.valueStyle);

      fields.append(term, detail);
    });
    root.appendChild(fields);
  }

  return root;
};

// A caller's `popup` replaces the descriptor's entirely. A string it returns is rendered as text.
export const popupContent = (feature, descriptor, { popup, labelResolver } = {}) => {
  if (popup) {
    const supplied = popup(feature);
    return supplied === undefined || supplied === null ? null : asNode(supplied);
  }
  const rows = popupFor(descriptor, feature, labelResolver);
  return rows ? popupElement(rows, descriptor?.popup) : null;
};

export const POPUP_OPTIONS = { className: 'atlas-popup-shell', maxWidth: 280 };

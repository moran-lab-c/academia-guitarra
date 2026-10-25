// h('div', { class: 'tarjeta', onclick }, hijos…): crea elementos sin librerías.
// ponytail: cada vista se vuelve a dibujar entera al cambiar los datos; si alguna pantalla llega a ir lenta
// o a perder lo que se escribe, esa pantalla (no la app) pasa a actualizarse por partes.
export function h(tag, props, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (['value', 'checked', 'selected', 'disabled'].includes(k)) el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

// Los valores de un formulario como objeto (los números, como números).
export function valores(form) {
  const res = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') res[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) res[el.name] = el.value; }
    else if (el.type === 'number') res[el.name] = el.value === '' ? null : Number(el.value);
    else res[el.name] = el.value;
  }
  return res;
}

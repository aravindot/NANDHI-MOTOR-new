export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return entities[character];
});

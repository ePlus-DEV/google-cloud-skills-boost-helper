const { randomBytes, randomUUID } = require('node:crypto');

function stringify(bytes) {
  const hex = [];
  for (const byte of bytes) {
    hex.push(byte.toString(16).padStart(2, '0'));
  }
  return `${hex.slice(0, 4).join('')}${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 12).join('')}-${hex
    .slice(12)
    .join('')}`;
}

function v4(options, buffer, offset) {
  if (typeof randomUUID === 'function' && options == null && buffer == null) {
    return randomUUID();
  }

  const bytes = options && Array.isArray(options.random)
    ? Uint8Array.from(options.random)
    : options && typeof options.rng === 'function'
      ? Uint8Array.from(options.rng())
      : randomBytes(16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  if (buffer) {
    const start = offset || 0;
    for (let index = 0; index < 16; index += 1) {
      buffer[start + index] = bytes[index];
    }
    return buffer;
  }

  return stringify(bytes);
}

module.exports = {
  v4
};
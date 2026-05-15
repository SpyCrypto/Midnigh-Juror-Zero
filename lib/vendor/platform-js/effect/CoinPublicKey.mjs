export function asHex(key) {
  if (typeof key === 'string') return key;
  if (key instanceof Uint8Array) return Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
  return String(key ?? '');
}
export function CoinPublicKey(hex) { return hex; }

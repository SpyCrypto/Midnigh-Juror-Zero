export function parseCoinPublicKeyToHex(key) { return typeof key === 'string' ? key : toHex(key); }
export function parseEncPublicKeyToHex(key) { return typeof key === 'string' ? key : toHex(key); }
export function assertDefined(value, msg) {
  if (value === undefined || value === null) throw new Error(msg ?? 'Expected value to be defined');
}
export function assertUndefined(value, msg) {
  if (value !== undefined && value !== null) throw new Error(msg ?? 'Expected value to be undefined');
}
export function assertIsContractAddress(addr) {
  if (typeof addr !== 'string' || addr.length === 0) throw new Error('Expected a valid contract address string');
}
export function fromHex(hex) {
  const cleaned = (typeof hex === 'string' ? hex : '').replace(/^0x/, '');
  return new Uint8Array((cleaned.match(/.{1,2}/g) ?? []).map(b => parseInt(b, 16)));
}
export function toHex(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}
export function ttlOneHour() { return BigInt(Date.now() + 3_600_000); }

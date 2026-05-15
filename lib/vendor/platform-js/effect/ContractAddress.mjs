export function ContractAddress(addr) { return addr; }
export function isContractAddress(value) { return typeof value === 'string' && value.length > 0; }

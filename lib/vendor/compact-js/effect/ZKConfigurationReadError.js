import { hasProperty } from 'effect/Predicate';

const TypeId = Symbol.for('compact-js/effect/ZKConfigurationReadError');

export class ZKConfigurationReadError extends Error {
  constructor({ contractTag, provableCircuitId, assetType, message, cause }) {
    super(message);
    this.name = 'ZKConfigurationReadError';
    this.contractTag = contractTag;
    this.provableCircuitId = provableCircuitId;
    this.assetType = assetType;
    this.cause = cause;
    this[TypeId] = TypeId;
  }
}

export const isReadError = (u) => hasProperty(u, TypeId);
export const make = (contractTag, provableCircuitId, assetType, cause) =>
  new ZKConfigurationReadError({
    contractTag,
    provableCircuitId,
    assetType,
    message: `Failed to read ${assetType.replaceAll('-', ' ')} for ${contractTag}#${provableCircuitId}`,
    cause,
  });

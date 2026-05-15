import { hasProperty } from 'effect/Predicate';

const TypeId = Symbol.for('compact-js/effect/ContractConfigurationError');

export class ContractConfigurationError extends Error {
  constructor({ message, contractState, cause }) {
    super(message);
    this.name = 'ContractConfigurationError';
    this.contractState = contractState;
    this.cause = cause;
    this[TypeId] = TypeId;
  }
}

export const isConfigurationError = (u) => hasProperty(u, TypeId);
export const make = (message, contractState, cause) =>
  new ContractConfigurationError({ message, contractState, cause });

import { hasProperty } from 'effect/Predicate';

const TypeId = Symbol.for('compact-js/effect/ContractRuntimeError');

export class ContractRuntimeError extends Error {
  constructor({ message, cause }) {
    super(message);
    this.name = 'ContractRuntimeError';
    this.cause = cause;
    this[TypeId] = TypeId;
  }
}

export const isRuntimeError = (u) => hasProperty(u, TypeId);
export const make = (message, cause) =>
  new ContractRuntimeError({ message, cause });

import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  open_case(context: __compactRuntime.CircuitContext<PS>, new_case_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  register_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  select_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  begin_deliberation(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cast_vote(context: __compactRuntime.CircuitContext<PS>, choice_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  close_case(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  open_case(context: __compactRuntime.CircuitContext<PS>, new_case_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  register_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  select_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  begin_deliberation(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cast_vote(context: __compactRuntime.CircuitContext<PS>, choice_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  close_case(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  open_case(context: __compactRuntime.CircuitContext<PS>, new_case_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  register_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  select_juror(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  begin_deliberation(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cast_vote(context: __compactRuntime.CircuitContext<PS>, choice_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  close_case(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly case_status: number;
  readonly guilty_votes: bigint;
  readonly not_guilty_votes: bigint;
  readonly abstain_votes: bigint;
  readonly juror_count: bigint;
  readonly selected_count: bigint;
  readonly case_id: bigint;
  readonly nonce: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;

export interface OnChainState {
  case_status: string;
  guilty_votes: number;
  not_guilty_votes: number;
  abstain_votes: number;
  juror_count: number;
  selected_count: number;
  case_id: string;
}

export type AppStep = 'idle' | 'deploying' | 'attaching' | 'ready';

export type ActionStep =
  | 'idle'
  | 'open_case'
  | 'register_juror'
  | 'select_juror'
  | 'begin_deliberation'
  | 'cast_vote'
  | 'close_case';

export const EXPLORER = 'https://explorer.1am.xyz';
export const NETWORK = 'preview';
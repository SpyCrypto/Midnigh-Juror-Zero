import { Context, Layer, Effect } from 'effect';

export const Keys = Context.GenericTag('@midnight-ntwrk/platform-js/Configuration/Keys');

export const layer = Layer.effect(
  Keys,
  Effect.succeed({ coinPublicKey: '', encPublicKey: '' })
);

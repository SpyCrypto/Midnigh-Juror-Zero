import * as runtimeExports from './midnight_onchain_runtime_wasm_bg.js';
import { __wbg_set_wasm } from './midnight_onchain_runtime_wasm_bg.js';
export * from './midnight_onchain_runtime_wasm_bg.js';

const wasmUrl = 'https://cdn.jsdelivr.net/npm/@midnight-ntwrk/onchain-runtime-v3@3.0.0/midnight_onchain_runtime_wasm_bg.wasm';
let initPromise;

function initRuntime() {
  if (!initPromise) {
    initPromise = fetch(wasmUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load Midnight runtime WASM: ' + response.status);
        }
        return response.arrayBuffer();
      })
      .then((wasmBytes) => WebAssembly.instantiate(wasmBytes, {
        './midnight_onchain_runtime_wasm_bg.js': runtimeExports,
      }))
      .then(({ instance }) => {
        const wasm = instance.exports;
        __wbg_set_wasm(wasm);
        if (typeof wasm.__wbindgen_start !== 'function') {
          throw new Error('Midnight runtime WASM failed to initialize.');
        }
        wasm.__wbindgen_start();
        return wasm;
      });
  }
  return initPromise;
}

export const __wbindgen_ready = initRuntime();
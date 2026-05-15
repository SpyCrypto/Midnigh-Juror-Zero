import * as runtimeExports from './midnight_ledger_wasm_bg.js';
import { __wbg_set_wasm } from './midnight_ledger_wasm_bg.js';
export * from './midnight_ledger_wasm_bg.js';

const wasmUrl = 'https://cdn.jsdelivr.net/npm/@midnight-ntwrk/ledger-v8@8.0.3-rc.1/midnight_ledger_wasm_bg.wasm';

const snippetImports = {
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline0.js`]: { PreTranscript_: () => runtimeExports.PreTranscript },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline1.js`]: { UnshieldedOffer_: () => runtimeExports.UnshieldedOffer },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline2.js`]: { ZswapOutput_: () => runtimeExports.ZswapOutput },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline3.js`]: { ZswapTransient_: () => runtimeExports.ZswapTransient },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline4.js`]: { ZswapOffer_: () => runtimeExports.ZswapOffer },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline5.js`]: { ZswapInput_: () => runtimeExports.ZswapInput },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline6.js`]: { PrePartitionContractCall_: () => runtimeExports.PrePartitionContractCall },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline7.js`]: { DustRegistration_: () => runtimeExports.DustRegistration },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline8.js`]: { DustActions_: () => runtimeExports.DustActions },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline9.js`]: { DustSpend_: () => runtimeExports.DustSpend },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline10.js`]: { SignatureEnabled_: () => runtimeExports.SignatureEnabled },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline11.js`]: { PreBinding_: () => runtimeExports.PreBinding },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline12.js`]: { Binding_: () => runtimeExports.Binding },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline13.js`]: { SignatureErased_: () => runtimeExports.SignatureErased },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline14.js`]: { NoBinding_: () => runtimeExports.NoBinding },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline15.js`]: { PreProof_: () => runtimeExports.PreProof },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline16.js`]: { Proof_: () => runtimeExports.Proof },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline17.js`]: { Intent_: () => runtimeExports.Intent },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline18.js`]: { MaintenanceUpdate_: () => runtimeExports.MaintenanceUpdate },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline19.js`]: { ReplaceAuthority_: () => runtimeExports.ReplaceAuthority },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline20.js`]: { VerifierKeyRemove_: () => runtimeExports.VerifierKeyRemove },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline21.js`]: { ContractDeploy_: () => runtimeExports.ContractDeploy },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline22.js`]: { VerifierKeyInsert_: () => runtimeExports.VerifierKeyInsert },
  [`./snippets/midnight-ledger-wasm-1feda82f315cb89b/inline23.js`]: { ContractCall_: () => runtimeExports.ContractCall },
};

let initPromise;

function initRuntime() {
  if (!initPromise) {
    initPromise = fetch(wasmUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load Midnight ledger WASM: ' + response.status);
        }
        return response.arrayBuffer();
      })
      .then((wasmBytes) =>
        WebAssembly.instantiate(wasmBytes, {
          ...snippetImports,
          './midnight_ledger_wasm_bg.js': runtimeExports,
        }),
      )
      .then(({ instance }) => {
        const wasm = instance.exports;
        __wbg_set_wasm(wasm);
        if (typeof wasm.__wbindgen_start === 'function') {
          wasm.__wbindgen_start();
        }
        return wasm;
      });
  }

  return initPromise;
}

export const __wbindgen_ready = initRuntime();

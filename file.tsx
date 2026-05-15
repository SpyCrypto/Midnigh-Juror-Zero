// 1. Lazy-load everything after wallet connects
const getRuntime = async (providers) => {
  const [
    { createManagedContractRuntime },
    contractModule,
    { managedArtifacts }
  ] = await Promise.all([
    import('./lib/compact-contract'),
    import('./managed/my_contract/contract/index.js'),
    import('./managed/my_contract/compiler/artifact-map'),
  ]);

  return createManagedContractRuntime({
    compiledContract: contractModule,
    artifacts: managedArtifacts,
    wallet: providers,
  });
};

// 2. Deploy
const runtime = await getRuntime(providers);
const { address } = await runtime.deploy();

// 3. Attach to existing
const instance = await runtime.attach(contractAddress);

// 4. Call a circuit
await instance.invoke('increment');

// 5. Read ledger state
const state = await runtime.read(contractAddress);
// ✗ WRONG — useEffect callback can't be async directly
useEffect(async () => {
  await someAsyncFn();  // ← error here
}, []);

// ✓ FIXED
useEffect(() => {
  const run = async () => {
    await someAsyncFn();
  };
  run();
}, []);
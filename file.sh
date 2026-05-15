# From repo root
cp contract.compact src/contract.compact
cp App.tsx src/App.tsx
cp ContractPanel.tsx src/components/ContractPanel.tsx
cp JurorConsole.tsx src/components/JurorConsole.tsx
cp types.ts src/types.ts

git add .
git commit -m "feat: migrate to 1AM wallet + Compact v0.30.0 + new UI"
git push origin feat/1am-wallet-bridge
# Tacit Web3

# Installation

## Frontend and Contracts

Node Version 16 LTS is the default

`npm install`

## Smart Contract Testing

Uses Foundry, install via:
https://book.getfoundry.sh/getting-started/installation.html

Run tests with:  
` forge test --watch -vv --fork-url <ETH_MAINNET_RPC> --fork-block-number 3902330`

## Add gasless transactions for a new contract

- Deploy contract
- If new chain, add dapp on https://biconomy.io
- Add contract to dapp on Biconomy, use new contract address and abi (only abi key of <contract_name>.json ABI file, is
  just an array)
- Add methods that you want to be gasless under API in Biconomy

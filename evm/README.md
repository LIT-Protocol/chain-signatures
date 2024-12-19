# Chain Signatures EVM Contracts

This repository contains the Solidity contracts used for testing and demonstration purposes in the Lit Protocol's Chain Signatures package.

## Contracts

### StringStorage
A simple contract used for testing and demonstration purposes. It allows:
- Storing a string value
- Retrieving the stored string
- Emits events when the string is updated

### TransactionEmitter

## Usage
A contract designed to work with Lit Protocol's Automation package for cross-chain transaction forwarding. It:
- Emits events containing transaction intent data
- Enables the Lit Protocol to monitor and forward transactions between different EVM chains
- Works in conjunction with the Automation package to facilitate cross-chain communication

## Development

Build the contracts:
```shell
forge build
```

Run tests:
```shell
forge test
```




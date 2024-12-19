# Lit Protocol ChainSignatures example

An example of how to use Lit Protocol's Automation to forward transactions from any source chain to any destination chain.

## Introduction

This example uses Lit Protocol's automation capabilities to listen for transaction request events on a source chain and
forward/broadcast them in a destination chain.

We use the TransactionEmitter contract, deployed on the Base Sepolia chain, to listen for transaction
requests.
Then we use a Lit Automation to forward that same transaction in a different chain. In this case using Ethereum Sepolia
chain as the destination chain.

Chains, contracts and transactions are all configurable or dynamic, as long as the automation script listens for the
right events and has funds to pay for gas on the destination chain.

## How it works

When a transaction request is received on the source chain, the TransactionEmitter contract emits a
TransactionIntentCreated event.

The TransactionIntentCreated event contains the following information:

- Chain ID: The ID of the chain where the transaction is being broadcast.
- To: The address of the target contract on the destination chain.
- Value: The amount of native currency to be transferred (in the destination chain's native currency).
- Data: The encoded transaction data.

That is, all the necessary information to construct a transaction on the destination chain is included in the
TransactionIntentCreated event.

Then a Lit Protocol automation script listens for the TransactionIntentCreated event and decodes the transaction data,
constructs a transaction for the destination chain, and sends it to the target contract address.

## Project Structure

- evm: Contains the Solidity contracts used for the example.
    - StringStorage.sol: A simple contract that stores a string value.
    - TransactionEmitter.sol: A contract that emits TransactionIntentCreated events when a transaction is received.
- server: Contains the automation script that listens for TransactionIntentCreated events and forwards them to the
  target contract on the destination chain.
- client: Contains the script that sends a transaction to the target contract on the destination chain using the source
  chain's TransactionEmitter contract and, transitively, the automation script.

## Prerequisites

- Node.js and npm installed
- A Lit PKP funded with some Sepolia ETH, enough to pay for gas
- An Ethereum private key, as an authorized signer of the PKP
- If using Lit Network that require payment, a minted Capacity NFT usable by the PKP

## Running

1. Install dependencies on `server`, `client` and `evm` folders

2. Copy each .env.example file to .env and fill in the required values:

- ETHEREUM_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
- RPC_URL_SEPOLIA=https://ethereum-sepolia-rpc.publicnode.com # Or use your own RPC URL
- RPC_URL_BASE_SEPOLIA=https://sepolia.basescan.org # Or use your own RPC URL
- STRING_STORAGE_ADDRESS=0x2a8505Cf7e2d2b25Ca49988Ddc22BC315713401F # Ethereum Sepolia. Or use your own address
- TRANSACTION_EMITTER_ADDRESS=0x3966a9746A814Bf9E4F33AB6453077A7B12AD759 # Base Sepolia. Or use your own address

3. Fill the `pkp` and `capacityTokenId` if used, values at `server/forwardTxs.ts` file with the previously created Lit PKP and Capacity NFT.

4. On `client/sendCrossChainTx.ts` file, you can change `newString` value to modify the string that will be stored on the destination chain StringStorage contract.

5. Build the ABI files for client and server to consume
```bash
cd evm
forge build
```

6. Start the server and wait until seeing `enter forwardIntentsAsTransactions` in the console to ensure it is listening for events
```bash
cd server
npm run dev
```

7. Start the client and wait until the process completes
```bash
cd client
npm run dev
```

The client script will print the new string and who updated it, which should be the Lit Automation PKP address
```
...
StringUpdated event received:
New String: ChainSignatures are alive!!!
Updater: 0xYOUR_PKP_ADDRESS
...
```

import * as dotenv from 'dotenv';
import { Address, PKPInfo, StateMachine } from '@lit-protocol/automation';
import { LIT_NETWORK as POSSIBLE_LIT_NETWORKS, LIT_EVM_CHAINS } from '@lit-protocol/constants';

// Dev: Build the contract ABI if it doesn't exist
import * as TransactionEmitterABI from '../evm/out/TransactionEmitter.sol/TransactionEmitter.json';

dotenv.config();

function logAndExit(err: unknown): never {
  console.error(err);
  process.exit(1);
}

function onMachineError(error: unknown, context?: string): never {
  console.error(context || 'Error running state machine', error);
  logAndExit(error);
}

const LIT_NETWORK = POSSIBLE_LIT_NETWORKS.DatilDev;
const pkp = {
  tokenId: '0x...',
  publicKey:
    '0x...',
  ethAddress: '0x...',
} as PKPInfo;
// const capacityTokenId = '12345';
const TransactionEmitterAddress = process.env.TRANSACTION_EMITTER_ADDRESS as Address;

async function main() {
  const ethPrivateKey = process.env.ETHEREUM_PRIVATE_KEY;
  if (!ethPrivateKey) {
    throw new Error('ethPrivateKey not defined');
  }

  const evmSourceNetwork = LIT_EVM_CHAINS.baseSepolia;

  const stateMachine = StateMachine.fromDefinition({
    debug: true,
    onError: onMachineError,
    privateKey: ethPrivateKey, // Used only for authorization here, minting was done previously
    litNodeClient: {
      litNetwork: LIT_NETWORK,
    },
    litContracts: {
      network: LIT_NETWORK,
    },
    states: [
      {
        key: 'setPKPAndCapacityNFT',
        actions: [
          {
            key: 'usePkp',
            pkp, // Configure the pkp passed. Not minting a new one
          },
          // {
          //   key: 'useCapacityNFT',
          //   capacityTokenId: capacityTokenId, // Configure the capacity token to use. Not minting a new one
          // },
        ],
        transitions: [{ toState: 'forwardIntentsAsTransactions' }],
      },
      {
        key: 'forwardIntentsAsTransactions',
        actions: [
          {
            key: 'context',
            log: {
              path: '',
            },
          },
        ],
        transitions: [
          // Waits to receive an USDC transfer in our destination
          {
            toState: 'forwardIntentsAsTransactions', // Not leaving this state, but broadcasting intents to destination chain
            evmContractEvent: {
              evmChainId: evmSourceNetwork.chainId,
              contractAddress: TransactionEmitterAddress,
              contractABI: TransactionEmitterABI.abi,
              eventName: 'TransactionIntentCreated',
              contextUpdates: [
                // The transition can perform some updates to the context
                {
                  dataPath: 'event.args[0]',
                  contextPath: 'transfer.evmChainId',
                },
                {
                  dataPath: 'event.args[1]',
                  contextPath: 'transfer.contractAddress',
                },
                {
                  dataPath: 'event.args[2]',
                  contextPath: 'transfer.value',
                },
                {
                  dataPath: 'event.args[3]',
                  contextPath: 'transfer.data',
                },
                {
                  // Not used but useful for charging the sender
                  dataPath: 'event.args[4]',
                  contextPath: 'transfer.sender',
                },
              ],
            },
            actions: [
              {
                key: 'context',
                log: {
                  path: '',
                },
              },
              {
                key: 'transaction',
                evmChainId: {
                  contextPath: 'transfer.evmChainId',
                },
                contractAddress: {
                  contextPath: 'transfer.contractAddress',
                },
                value: {
                  contextPath: 'transfer.value',
                },
                data: {
                  contextPath: 'transfer.data',
                },
              },
            ],
          },
        ],
      },
    ],
  });

  await stateMachine.startMachine('setPKPAndCapacityNFT');
}

main().catch(logAndExit);

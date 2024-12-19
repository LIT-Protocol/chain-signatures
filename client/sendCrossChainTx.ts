import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

// Dev: Build the contract ABIs if they don't exist
import * as StringStorageABI from '../evm/out/StringStorage.sol/StringStorage.json';
import * as TransactionEmitterABI from '../evm/out/TransactionEmitter.sol/TransactionEmitter.json';

dotenv.config();

async function main() {
  const ethPrivateKey = process.env.ETHEREUM_PRIVATE_KEY!;
  if (!ethPrivateKey) {
    throw new Error('ethPrivateKey not defined');
  }

  // Sepolia Provider and Wallet (for encoding StringStorage data)
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_SEPOLIA);
  const sepoliaWallet = new ethers.Wallet(ethPrivateKey, sepoliaProvider);

  // Base Sepolia Provider and Wallet (for sending the transaction through TransactionEmitter)
  const baseSepoliaProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_BASE_SEPOLIA);
  const baseSepoliaWallet = new ethers.Wallet(ethPrivateKey, baseSepoliaProvider);

  // StringStorage Contract Instance (on Sepolia - only used here for encoding tx data)
  const stringStorageAddress = process.env.STRING_STORAGE_ADDRESS!;
  const stringStorage = new ethers.Contract(stringStorageAddress, StringStorageABI.abi, sepoliaWallet);

  // TransactionEmitter Contract Instance (on Base Sepolia)
  const transactionEmitterAddress = process.env.TRANSACTION_EMITTER_ADDRESS!;
  const transactionEmitter = new ethers.Contract(transactionEmitterAddress, TransactionEmitterABI.abi, baseSepoliaWallet);

  // Data to set in StringStorage
  const newString = 'ChainSignatures are alive!!!';

  // Encode the StringStorage setString function call data
  const stringStorageInterface = new ethers.utils.Interface(StringStorageABI.abi);
  const stringStorageData = stringStorageInterface.encodeFunctionData('setString', [newString]);

  // Start listening for StringUpdated events on Sepolia, will wait for this after sending the transaction
  console.log('Starting to listen for StringUpdated events...');
  stringStorage.on('StringUpdated', (newString, updater, event) => {
    console.log('StringUpdated event received:');
    console.log('New String:', newString);
    console.log('Updater:', updater);
    console.log('Event:', event);

    stringStorage.removeAllListeners('StringUpdated');
  });
  console.log('StringUpdated listener started');

  // Transaction parameters for TransactionEmitter
  const chainId = 11155111; // Sepolia chain ID
  const to = stringStorageAddress; // StringStorage contract address on Sepolia
  const value = 0; // No value transfer (in destination chain native currency)
  const data = stringStorageData; // Encoded StringStorage function call

  // Send the transaction through TransactionEmitter on source chain
  const tx = await transactionEmitter.emitTransactionIntent(chainId, to, value, data);
  console.log('Transaction sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('Transaction mined!');

  // Verify the event emission
  const transactionIntentCreatedEvent = receipt?.logs.find((log: ethers.providers.Log) => {
    try {
      transactionEmitter.interface.parseLog(log);
      return log.topics[0] === transactionEmitter.interface.getEventTopic('TransactionIntentCreated')
    } catch (error) {
      return false; // Log doesn't match the event
    }
  });

  if (transactionIntentCreatedEvent) {
    const parsedEvent = transactionEmitter.interface.parseLog(transactionIntentCreatedEvent);
    console.log('TransactionIntentCreated event emitted:', parsedEvent.args);
  } else {
    throw new Error('TransactionIntentCreated event not found in transaction receipt.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

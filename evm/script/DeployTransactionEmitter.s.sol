// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/TransactionEmitter.sol";

contract DeployTransactionEmitter is Script {
    function run() public {
        vm.startBroadcast();
        TransactionEmitter transactionEmitter = new TransactionEmitter();
        console.log("TransactionEmitter deployed to:", address(transactionEmitter));
        vm.stopBroadcast();
    }
}

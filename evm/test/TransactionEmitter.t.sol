// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/TransactionEmitter.sol";

contract TransactionEmitterTest is Test {
    TransactionEmitter public transactionEmitter;

    function setUp() public {
        transactionEmitter = new TransactionEmitter();
    }

    function testEmitTransactionIntent() public {
        uint256 testChainId = 1;
        address testTo = address(0x1234);
        uint256 testValue = 1 ether;
        bytes memory testData = abi.encodeWithSignature("testFunction(uint256)", 123);

        vm.expectEmit(true, true, true, true);
        emit TransactionEmitter.TransactionIntentCreated(testChainId, testTo, testValue, testData, address(this));

        transactionEmitter.emitTransactionIntent(testChainId, testTo, testValue, testData);
    }
}

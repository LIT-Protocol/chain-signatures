// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract TransactionEmitter {
    event TransactionIntentCreated(
        uint256 indexed chainId,
        address to,
        uint256 value,
        bytes data,
        address indexed sender
    );

    function emitTransactionIntent(
        uint256 _chainId,
        address _to,
        uint256 _value,
        bytes memory _data
    ) public {
        emit TransactionIntentCreated(_chainId, _to, _value, _data, msg.sender);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract StringStorage {
    string public storedString;

    event StringUpdated(string newString, address indexed updater);

    function setString(string memory _newString) public {
        storedString = _newString;
        emit StringUpdated(_newString, msg.sender);
    }

    function getString() public view returns (string memory) {
        return storedString;
    }
}

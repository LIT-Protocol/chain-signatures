// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/StringStorage.sol";

contract StringStorageTest is Test {
    StringStorage public stringStorage;

    function setUp() public {
        stringStorage = new StringStorage();
    }

    function testSetAndGetString() public {
        string memory testString = "Hello, Foundry!";

        vm.expectEmit(true, false, true, false);
        emit StringStorage.StringUpdated(testString, address(this));

        stringStorage.setString(testString);
        assertEq(stringStorage.getString(), testString);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/StringStorage.sol";

contract DeployStringStorage is Script {
    function run() public {
        vm.startBroadcast();
        StringStorage stringStorage = new StringStorage();
        console.log("StringStorage deployed to:", address(stringStorage));
        vm.stopBroadcast();
    }
}

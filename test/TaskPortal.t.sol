// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/TaskPortal.sol";
import "forge-std/console.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

using stdStorage for StdStorage;

contract TaskPortalTest is Test {
    TaskPortal taskPortal;
    address daiTokenAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    //    address daiTokenAddress = 0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671;
    bytes defaultTaskData =
        "bafybeigyhfbk2s3pbt34qdyrxpst2wbqengha3n7eziqkv4krbavvjo5mm/1c21055d221e684d8739678a1e51a474";
    address[] addresses;
    bytes32[] nodePaths;
    bool[] isOpens;

    function setUp() public {
        taskPortal = new TaskPortal(address(0));
        addresses = new address[](0);
        nodePaths = new bytes32[](0);
        isOpens = new bool[](0);
    }

    function getRandomWalletAddress() public returns (address) {
        skip(10);
        bytes32 addr = keccak256(abi.encodePacked(block.timestamp));
        return address(uint160(uint256(addr)));
    }

    //    function writeTokenBalance(address who, address token, uint256 _amount) internal {
    //        uint256 amount = _amount * 1e18;
    //        deal(address(token), who, amount);
    //
    //        emit log_uint(
    //            stdstore
    //            .target(token)
    //            .sig(IERC20(token).balanceOf.selector)
    //            .with_key(who)
    //            .find());
    //
    //        uint256 allowanceAmount = IERC20(token).allowance(msg.sender, taskPortal.thisAddress());
    //        emit log_named_uint("allowance amount from external ERC20", allowanceAmount);
    //    }
    //
    //    function addTaskWithErc20TokenBounty(bytes memory taskData) internal returns (bytes32) {
    //        writeTokenBalance(msg.sender, daiTokenAddress, 1000);
    //
    //        vm.prank(msg.sender);
    //        return taskPortal.addTask(taskData, daiTokenAddress, 1);
    //    }

    function addTaskWithEthBounty(bytes memory taskData)
        internal
        returns (bytes32)
    {
        vm.prank(msg.sender);
        return taskPortal.addTask{value: 3 ether}(taskData, address(0), 0);
    }

    function testTaskCreationWithEth(bytes memory taskData) public {
        vm.assume(taskData.length > 0);

        assertEq(taskPortal.nodesCount(), 1);

        bytes32 taskPath = addTaskWithEthBounty(taskData);
        assertEq(taskPortal.nodesCount(), 3);

        bytes32[] memory tasks = taskPortal.getAllTasks();
        assertEq(tasks.length, 1);
        assertEq(tasks[0], taskPath);

        bytes32 nodeParent;
        address nodeOwner;
        NodeType nodeType;
        bytes memory nodeData;
        bool nodeIsOpen;
        (nodeParent, nodeOwner, nodeType, nodeData,, nodeIsOpen,) =
            taskPortal.getNode(taskPath);

        assertEq(nodeParent, taskPortal.rootTaskPath());
        assertEq(nodeOwner, msg.sender);
        assertEq(uint256(nodeType), uint256(NodeType.Task));
        assertEq(nodeData, taskData);
        assert(nodeIsOpen);
    }

    //     disabled until I get to fix the allowance call to the ERC20 token so that we can transfer
    //    function testTaskCreationWithErc20(bytes memory taskData) public {
    //        vm.assume(taskData.length > 0);
    //
    //        assertEq(taskPortal.nodesCount(), 1);
    //
    //        bytes32 taskPath = addTaskWithErc20TokenBounty(taskData);
    //        assertEq(taskPortal.nodesCount(), 2);
    //
    //        bytes32[] memory tasks = taskPortal.getTasks();
    //        assertEq(tasks.length, 1);
    //        assertEq(tasks[0], taskPath);
    //
    //        bytes32 nodeParent;
    //        address nodeCreator;
    //        NodeType nodeType;
    //        bytes memory nodeData;
    //        (nodeParent, nodeCreator, nodeType, nodeData,,) = taskPortal.getNode(taskPath);
    //
    //        assertEq(nodeParent, taskPortal.rootTaskPath());
    //        assertEq(nodeCreator, msg.sender);
    //        assertEq(uint(nodeType), uint(NodeType.Task));
    //        assertEq(nodeData, taskData);
    //    }

    function testTaskToShareToSolutionFlow() public {
        bytes memory taskData = defaultTaskData;
        bytes32 taskPath = addTaskWithEthBounty(taskData);

        vm.prank(getRandomWalletAddress());
        bytes32 sharePath1 = taskPortal.addShare(taskPath, "some share data");
        address secondShareSenderAddress = getRandomWalletAddress();
        vm.prank(secondShareSenderAddress);
        bytes32 sharePath2 = taskPortal.addShare(sharePath1, "some share data2");
        vm.prank(getRandomWalletAddress());
        bytes32 solutionPath =
            taskPortal.addSolution(sharePath2, "some solution data");
        //        emit log_named_bytes32("sharePath1", sharePath1);
        //        emit log_named_bytes32("sharePath2", sharePath2);
        //        emit log_named_bytes32("solutionPath", solutionPath);

        assertEq(taskPortal.nodesCount(), 6);
        bytes32[] memory taskChildNodes;
        (,,,, taskChildNodes,,) = taskPortal.getNode(taskPath);
        assertEq(taskChildNodes.length, 2);

        bytes32 childTaskPath;
        for (uint8 i = 0; i < taskChildNodes.length; i++) {
            (,,,,,, childTaskPath) = taskPortal.getNode(taskChildNodes[i]);
            assertEq(childTaskPath, taskPath);
        }

        bytes32[] memory firstShareChildNodes;
        bytes32 firstShareTaskPath;
        (,,,, firstShareChildNodes,, firstShareTaskPath) =
            taskPortal.getNode(sharePath1);

        assertEq(firstShareChildNodes.length, 1);
        assertEq(firstShareChildNodes[0], sharePath2);
        assertEq(firstShareTaskPath, taskPath);

        bytes32[] memory secondShareChildNodes;
        bytes32 secondShareTaskPath;
        (,,,, secondShareChildNodes,, secondShareTaskPath) =
            taskPortal.getNode(sharePath2);

        assertEq(secondShareChildNodes.length, 1);
        assertEq(secondShareChildNodes[0], solutionPath);
        assertEq(secondShareTaskPath, taskPath);
    }

    function testTaskUpdateNodesIsOpens() public {
        bytes memory taskData = defaultTaskData;

        bytes32 taskPath = addTaskWithEthBounty(taskData);
        vm.prank(getRandomWalletAddress());
        bytes32 sharePath1 = taskPortal.addShare(taskPath, "some share data");
        vm.prank(getRandomWalletAddress());
        bytes32 sharePath2 = taskPortal.addShare(taskPath, "some share data2");
        vm.prank(getRandomWalletAddress());
        bytes32 solutionPath =
            taskPortal.addSolution(sharePath1, "some solution data");

        assertEq(taskPortal.nodesCount(), 6);

        nodePaths = [taskPath, sharePath1, sharePath2, solutionPath];
        isOpens = [false, true, false, true];

        vm.prank(msg.sender);
        uint256 updatedNodesCount =
            taskPortal.updateNodesIsOpen(nodePaths, isOpens);
        assertEq(updatedNodesCount, 2, "All nodes must have been updated");

        bool validateNodeIsOpen;
        for (uint8 i = 0; i < nodePaths.length; i++) {
            (,,,,, validateNodeIsOpen,) = taskPortal.getNode(nodePaths[i]);
            assertEq(validateNodeIsOpen, isOpens[i]);
        }
    }

    function testTaskPayout() public {
        bytes memory taskData = defaultTaskData;
        address bountyTokenAddress = address(0);

        bytes32 taskPath = addTaskWithEthBounty(taskData);
        address shareAddress1 = address(1337);
        vm.prank(shareAddress1);
        bytes32 sharePath1 = taskPortal.addShare(taskPath, "some share data");
        address shareAddress2 = address(1338);
        vm.prank(shareAddress2);
        taskPortal.addShare(taskPath, "some share data2");
        address solutionAddress = address(1339);
        vm.prank(solutionAddress);
        taskPortal.addSolution(sharePath1, "some solution data");

        addresses = [shareAddress1, shareAddress2, solutionAddress];
        uint256[] memory amounts = new uint256[](addresses.length);
        uint256 payoutPerNodeAmount = 10 ** 18;
        amounts[0] = payoutPerNodeAmount;
        amounts[1] = payoutPerNodeAmount;
        amounts[2] = payoutPerNodeAmount;
        address[] memory tokenAddresses = new address[](addresses.length);
        tokenAddresses[0] = bountyTokenAddress;
        tokenAddresses[1] = bountyTokenAddress;
        tokenAddresses[2] = bountyTokenAddress;

        vm.prank(msg.sender);
        taskPortal.payoutTask(taskPath, addresses, tokenAddresses, amounts);

        assertEq(shareAddress1.balance, payoutPerNodeAmount);
        assertEq(shareAddress2.balance, payoutPerNodeAmount);
        assertEq(solutionAddress.balance, payoutPerNodeAmount);

        Bounty[] memory bounties = taskPortal.getBountiesForTask(taskPath);
        assertEq(bounties[0].amount, 0);
    }

    function testTaskPayoutTopUpAndPayout() public {
        address bountyTokenAddress = address(0);
        bytes32 taskPath = addTaskWithEthBounty(" ");

        address shareAddress1 = address(1337);
        vm.prank(shareAddress1);
        taskPortal.addShare(taskPath, "some share data");

        Bounty[] memory bounties = taskPortal.getBountiesForTask(taskPath);
        assertEq(bounties[0].amount, 3 ether);
        assertEq(bounties[0].tokenAddress, bountyTokenAddress);

        vm.prank(msg.sender);
        address[] memory receiverAddresses = new address[](1);
        receiverAddresses[0] = shareAddress1;
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = address(0);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 2 ether;

        taskPortal.payoutTask(
            taskPath, receiverAddresses, tokenAddresses, amounts
        );
        bounties = taskPortal.getBountiesForTask(taskPath);
        assertEq(bounties[0].amount, 1 ether);

        address notTaskCreatorAddress = address(1338);
        vm.deal(notTaskCreatorAddress, 1 ether);
        vm.prank(notTaskCreatorAddress);
        taskPortal.increaseBounty{value: 1 ether}(taskPath, address(0), 1);

        bounties = taskPortal.getBountiesForTask(taskPath);
        assertEq(bounties[0].amount, 2 ether);
    }

    function testTaskUpdateOwnerThenUpdateData() public {
        bytes memory taskData = "initial task data test";
        bytes32 taskPath = addTaskWithEthBounty(taskData);

        bytes memory nodeData;
        (,,, nodeData,,,) = taskPortal.getNode(taskPath);

        assertEq(nodeData, taskData);

        address newOwnerAddress = getRandomWalletAddress();

        // fail when non-owner tries to update task owner
        vm.expectRevert(bytes("Only node owner can edit node"));
        taskPortal.updateTaskOwner(taskPath, newOwnerAddress);

        vm.prank(msg.sender);
        taskPortal.updateTaskOwner(taskPath, newOwnerAddress);

        address nodeOwner;
        (, nodeOwner,,,,,) = taskPortal.getNode(taskPath);

        assertEq(nodeOwner, newOwnerAddress);

        bytes memory newTaskData = "123 this is new data";
        vm.prank(newOwnerAddress);
        taskPortal.updateTaskData(taskPath, newTaskData);

        (,,, nodeData,,,) = taskPortal.getNode(taskPath);

        assertEq(nodeData, newTaskData);
    }

    function testTaskOwnerWithdrawsFromContractBalance() public {
        vm.prank(msg.sender);
        taskPortal = new TaskPortal(address(0));

        bytes memory taskData = "task data";
        addTaskWithEthBounty(taskData);
        uint256 ownerBalanceBeforeWithdraw = msg.sender.balance;
        uint256 amountToWithdraw = 1 ether;

        // fail when non-owner tries to withdraw
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        taskPortal.withdrawToOwner(amountToWithdraw);

        vm.prank(msg.sender);
        taskPortal.withdrawToOwner(amountToWithdraw);

        assertEq(address(taskPortal).balance, 2 ether);
        assertEq(msg.sender.balance - ownerBalanceBeforeWithdraw, 1 ether);
    }
}

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "forge-std/console.sol";
//import "lib/forge-std/src/console2.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

    enum NodeType {Task, Solution, Share}


// data structure inspired by https://medium.com/@sergiibomko/tree-in-solidity-90bd8b091263
    struct Node {
        bytes32 parent;   // parent node’s path
        bytes32 path;
        bytes32 taskPath;
        address owner;  //
        NodeType nodeType;   //
        bytes data;         // node’s data
        bytes32[] nodes;  // list of linked nodes’ paths
        bool isOpen;
    }

    struct Bounty {
        address tokenAddress;
        uint256 amount;
    }



contract TaskPortal {
    mapping(bytes32 => Bounty) bounties;
    mapping(bytes32 => Node) nodes;
    uint256 public nodesCount = 0;
    bytes32 public rootTaskPath;

    event NewNodeCreated(address indexed owner, bytes32 indexed parent, bytes32 path, NodeType nodeType);

    constructor() {
        rootTaskPath = _addNode("", "RootTask", msg.sender, NodeType.Task, "");
        console.log("Created TaskPortal root task with path");
        console.logBytes32(rootTaskPath);

        console.log(address(0));
    }

    modifier nodeExists(bytes32 _path) {
        require(nodes[_path].parent.length > 0, "Node does not exist");
        _;
    }

    modifier canEditNode(bytes32 _path) {
        require(nodes[_path].parent.length > 0, "Node does not exist");
        require(nodes[_path].owner == msg.sender, "Only node owner can edit node");
        _;
    }

    function getTask(bytes32 _path) public view nodeExists(_path) returns (address, bytes memory, bool, address, uint256) {
        Node storage node = nodes[_path];
        Bounty storage bounty = bounties[_path];
        return (node.owner, node.data, node.isOpen, bounty.tokenAddress, bounty.amount);
    }

    function getNode(bytes32 _path) public view nodeExists(_path) returns (bytes32, address, NodeType, bytes memory, bytes32[] memory, bool)  {
        Node storage node = nodes[_path];
        return (node.parent, node.owner, node.nodeType, node.data, node.nodes, node.isOpen);
    }

    function _addNode(bytes32 _parent, bytes memory _data, address _owner, NodeType _nodeType, bytes32 _taskPath) private returns (bytes32) {
        require(_data.length > 0);

        bytes32 _id = getNextNodeId();
        bytes32 path = keccak256(abi.encode(_parent, _id));

        nodes[path] = Node({
        owner : _owner,
        path : path,
        taskPath : _taskPath,
        nodeType : _nodeType,
        parent : _parent,
        data : _data,
        nodes : new bytes32[](0),
        isOpen : true
        });

        nodes[_parent].nodes.push(path);
        nodesCount += 1;

        emit NewNodeCreated(_owner, _parent, path, _nodeType);
        return path;
    }

    function getNextNodeId() private view returns (bytes32) {
        return keccak256(abi.encode(bytes32(nodesCount + 1), msg.sender));
    }

    function getAllTasks() public view returns (bytes32[] memory) {
        return nodes[rootTaskPath].nodes;
    }

    function addTask(bytes memory _data, address _tokenAddress, uint256 _amount) public payable returns (bytes32){
        uint256 amount;
        if (_tokenAddress == address(0)) {// no ERC token, but native chain currency is used
            require(msg.value > 0 wei, "Transaction must have value to create task with bounty");

            amount = msg.value;
        } else {
            require(_tokenAddress.code.length > 0, "_tokenAddress must be a contract address");
            require(_amount > 0, "ERC20 token must have _amount to create task with bounty");
            IERC20 token = IERC20(_tokenAddress);
            require(token.balanceOf(msg.sender) >= amount);

            amount = _amount;
            token.transferFrom(msg.sender, address(this), amount);
        }

        bytes32 taskPath = _addNode(rootTaskPath, _data, msg.sender, NodeType.Task, "");
        bounties[taskPath] = Bounty({tokenAddress : _tokenAddress, amount : amount});
        addShare(taskPath, "TaskCreatorShare");

        return taskPath;
    }

    receive() external payable {
        console.log("RECEIVED ETH");
    }

    function addShare(bytes32 _parent, bytes memory _data) public nodeExists(_parent) returns (bytes32) {
        bytes32 taskPath;
        if (uint(nodes[_parent].nodeType) == uint(NodeType.Task)) {
            taskPath = _parent;
        } else {
            taskPath = nodes[_parent].taskPath;
        }

        return _addNode(_parent, _data, msg.sender, NodeType.Share, taskPath);
    }

    function addSolution(bytes32 _parent, bytes memory _data) public nodeExists(_parent) returns (bytes32) {
        require(uint(nodes[_parent].nodeType) == uint(NodeType.Share));
        bytes32 taskPath = nodes[_parent].taskPath;
        return _addNode(_parent, _data, msg.sender, NodeType.Solution, taskPath);
    }

    function updateNodesIsOpen(bytes32[] memory _paths, bool[] memory _isOpens) public returns (uint) {
        require(_paths.length == _isOpens.length, "Node paths and isOpens must have same length");

        uint nodeUpdateCounter = 0;

        for (uint i = 0; i < _paths.length; i++) {
            bool canEditNodeThatShouldBeUpdated = nodes[_paths[i]].owner == msg.sender && nodes[_paths[i]].isOpen != _isOpens[i];
            if (canEditNodeThatShouldBeUpdated) {
                nodes[_paths[i]].isOpen = _isOpens[i];
                nodeUpdateCounter++;
            }
        }

        return nodeUpdateCounter;
    }

    // client must decide which nodes / paths to reward
    // payout is inefficient because we create a new transaction for each user
    function payoutTask(bytes32 taskPath, bytes32[] memory paths) public canEditNode(taskPath) {
        require(paths.length > 0, "");

        Bounty memory bounty = bounties[taskPath];
        require(bounty.amount > 0);

        // any checks we need to do before going into the loop?
        // bad if we get half-way through the loop and then revert
        uint bountyShare = bounty.amount / paths.length;

        if (bounty.tokenAddress == address(0)) {
            // no ERC token, but native chain currency is used) {
            require(address(this).balance >= bounty.amount, "Contract must have enough balance");

            for (uint i; i < paths.length; i++) {
                (bool success,) = payable(nodes[paths[i]].owner).call{value : bountyShare}("");
                require(success, "Failed to withdraw money from contract.");
            }
        } else {
            IERC20 token = IERC20(bounty.tokenAddress);
            require(token.balanceOf(address(this)) >= bounty.amount, "Contract must have enough balance of token");

            for (uint i; i < paths.length; i++) {
                token.transferFrom(address(this), nodes[paths[i]].owner, bountyShare);
            }
        }

        bounties[taskPath].amount = 0;
    }
}

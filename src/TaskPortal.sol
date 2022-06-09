// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "forge-std/console.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/metatx/ERC2771Context.sol";
import "../lib/openzeppelin-contracts/contracts/metatx/ERC2771Context.sol";

    enum NodeType {Task, Solution, Share}


// data structure inspired by https://medium.com/@sergiibomko/tree-in-solidity-90bd8b091263
    struct Node {
        bytes32 path;     // this node's path
        bytes32 parent;   // parent node’s path
        bytes32 taskPath; // path of task that this node belongs to
        address owner;    // address that created this node and has full write rights
        NodeType nodeType;
        bytes data;
        bytes32[] nodes;  // list of linked nodes’ paths
        bool isOpen;
    }

    struct Bounty {
        address tokenAddress;
        uint256 amount;
    }



contract TaskPortal is ERC2771Context, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    mapping(bytes32 => Bounty) bounties;
    mapping(bytes32 => Node) nodes;
    uint256 public nodesCount = 0;
    bytes32 public rootTaskPath;

    //    address private _trustedForwarder;

    event NewNodeCreated(address indexed owner, bytes32 indexed parent, bytes32 path, NodeType nodeType);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) Ownable() {
        rootTaskPath = _addNode("", "RootTask", msg.sender, NodeType.Task, "");
        console.log("Created TaskPortal root task with path");
        console.logBytes32(rootTaskPath);
    }

    receive() external payable {
        console.log("RECEIVED ETH");
    }

    modifier nodeExists(bytes32 _path) {
        require(nodes[_path].parent.length > 0, "Node does not exist");
        _;
    }

    modifier canEditNode(bytes32 _path) {
        require(nodes[_path].parent.length > 0, "Node does not exist");
        require(nodes[_path].owner == _msgSender(), "Only node owner can edit node");
        _;
    }

    function _msgSender() internal view virtual override(ERC2771Context, Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(ERC2771Context, Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    //    function setTrustedForwarder(address trustedForwarder) public onlyOwner {
    //        _trustedForwarder = trustedForwarder;
    //    }

    function getTask(bytes32 _path) public view nodeExists(_path) returns (address, bytes memory, bool, bytes32[] memory, address, uint256) {
        Node storage node = nodes[_path];
        Bounty storage bounty = bounties[_path];
        return (node.owner, node.data, node.isOpen, node.nodes, bounty.tokenAddress, bounty.amount);
    }

    function getNode(bytes32 _path) public view nodeExists(_path) returns (bytes32, address, NodeType, bytes memory, bytes32[] memory, bool, bytes32)  {
        Node storage node = nodes[_path];
        return (node.parent, node.owner, node.nodeType, node.data, node.nodes, node.isOpen, node.taskPath);
    }

    function getNextNodeId() private view returns (bytes32) {
        return keccak256(abi.encode(bytes32(nodesCount + 1), _msgSender()));
    }

    function getAllTasks() public view returns (bytes32[] memory) {
        return nodes[rootTaskPath].nodes;
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

    function addTask(bytes memory _data, address _tokenAddress, uint256 _amount) public payable returns (bytes32){
        uint256 amount;
        if (_tokenAddress == address(0)) {// no ERC token, but native chain currency is used
            require(msg.value > 0 wei, "Transaction must have value to create task with bounty");

            amount = msg.value;
        } else {
            require(_tokenAddress.code.length > 0, "_tokenAddress must be a contract address");
            require(_amount > 0, "ERC20 token must have _amount to create task with bounty");
            IERC20 token = IERC20(_tokenAddress);
            require(token.balanceOf(_msgSender()) >= amount);

            amount = _amount;
            token.safeTransferFrom(_msgSender(), address(this), amount);
        }

        bytes32 taskPath = _addNode(rootTaskPath, _data, _msgSender(), NodeType.Task, "");
        bounties[taskPath] = Bounty({tokenAddress : _tokenAddress, amount : amount});
        addShare(taskPath, "TaskCreatorShare");

        return taskPath;
    }

    function addShare(bytes32 _parent, bytes memory _data) public nodeExists(_parent) returns (bytes32) {

        bytes32 taskPath;
        if (uint(nodes[_parent].nodeType) == uint(NodeType.Task)) {
            taskPath = _parent;
        } else {
            taskPath = nodes[_parent].taskPath;
        }
        require(!hasSenderContributedToAnySubnode(taskPath), "One share per task for each wallet");

        return _addNode(_parent, _data, _msgSender(), NodeType.Share, taskPath);
    }

    function addSolution(bytes32 _parent, bytes memory _data) public nodeExists(_parent) returns (bytes32) {
        require(uint(nodes[_parent].nodeType) == uint(NodeType.Share));

        bytes32 taskPath = nodes[_parent].taskPath;
        return _addNode(_parent, _data, _msgSender(), NodeType.Solution, taskPath);
    }

    function hasSenderContributedToAnySubnode(bytes32 _path) public nodeExists(_path) view returns (bool) {
        bytes32[] memory _nodes = nodes[_path].nodes;
        for (uint i = 0; i < _nodes.length; i++) {
            if (nodes[_nodes[i]].owner == _msgSender()) {
                return true;
            }
            if (nodes[_nodes[i]].nodes.length > 0) {
                bool hasContributedToAnySubnode = hasSenderContributedToAnySubnode(_nodes[i]);
                if (hasContributedToAnySubnode) {
                    return true;
                }
            }
        }

        return false;
    }

    function updateNodesIsOpen(bytes32[] memory _paths, bool[] memory _isOpens) public returns (uint) {
        require(_paths.length == _isOpens.length, "Number of node paths and isOpens must be equal");

        uint nodeUpdateCounter = 0;

        for (uint i = 0; i < _paths.length; i++) {
            address taskOwner;
            if (uint(nodes[_paths[i]].nodeType) == uint(NodeType.Task)) {
                taskOwner = nodes[_paths[i]].owner;
            } else {
                taskOwner = nodes[nodes[_paths[i]].taskPath].owner;
            }

            bool canEditNodeThatShouldBeUpdated = taskOwner == _msgSender() && nodes[_paths[i]].isOpen != _isOpens[i];

            if (canEditNodeThatShouldBeUpdated) {
                nodes[_paths[i]].isOpen = _isOpens[i];
                nodeUpdateCounter++;
            }
        }

        return nodeUpdateCounter;
    }

    function payoutTask(bytes32 taskPath, bytes32[] memory paths, uint256[] memory amounts) public canEditNode(taskPath) {
        require(paths.length > 0, "No node paths provided");
        require(paths.length == amounts.length);

        Bounty memory bounty = bounties[taskPath];
        require(bounty.amount > 0);

        uint256 currentSum = 0;
        IERC20 token = IERC20(bounty.tokenAddress);

        for (uint i; i < paths.length; i++) {
            require(amounts[i] > 0);
            require(nodes[paths[i]].isOpen);
            currentSum = currentSum.add(amounts[i]);
            require(currentSum <= bounty.amount);

            // native chain currency = no ERC token used
            if (bounty.tokenAddress == address(0)) {
                require(address(this).balance >= amounts[i], "Contract must have enough balance");
                payable(nodes[paths[i]].owner).transfer(amounts[i]);
            } else {
                require(token.balanceOf(address(this)) >= amounts[i], "Contract must have enough tokens");
                token.safeTransferFrom(address(this), nodes[paths[i]].owner, amounts[i]);
            }
        }

        bounties[taskPath].amount = bounties[taskPath].amount - currentSum;
    }
}

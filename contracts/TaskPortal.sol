// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

struct Task {
    string title;
    string description;
}



contract TaskPortal {
    enum NodeType {Task, Solution, Action}

    // inspired by https://medium.com/@sergiibomko/tree-in-solidity-90bd8b091263
    struct Node {
        bytes32 name;     // name of node
        address creator;  //
        NodeType nodeType;   //
        bytes32 parent;   // parent node’s path
        bytes32 data;     // node’s data
        bytes32[] nodes;  // list of linked nodes’ paths
    }

    // how can I store different ERC20 tokens instead of just ETH / native currency
    // mapping(bytes32 => uint256) public taskBalances;

    mapping(bytes32 => Node) nodes;

    Task[] public tasks;

    event NewTaskCreated(Task task);

    constructor() {
        console.log("Created TaskPortal");
    }


    function get(bytes32 _name, bytes32 _parent) public view returns (bytes32, bytes32, bytes32, bytes32[]) {
        Node storage node = nodes[keccak256(_parent, _name)];
        return (node.name, node.parent, node.data, node.nodes);
    }


    function addNode(bytes32 _name, bytes32 _parent, bytes32 _data, address _creator, NodeType _nodeType) private {
        require(_name.length > 0);
        bytes32 path = keccak256(_parent, _name);
        nodes[path] = Node({
        name : _name,
        creator: _creator,
        nodeType: _nodeType,
        parent : _parent,
        data : _data,
        nodes : new bytes32[](0)
        });
        nodes[_parent].nodes.push(path);
    }


    function addTask(string memory title, string memory description) public {
        // todo: refactor to create node with action 'CreateTask'
        //        tasks.push(Task(title, description));
        bytes32 name = keccak256(title);
        addNode(name, "", keccak256(description), msg.sender, NodeType.Task);

        emit NewTaskCreated(name);
    }


    function addShare() public returns (bytes32) {
        // todo: create node with action = 'Share'
        bytes32 newNode;
        return newNode;
    }

    function addSolution(string memory content) public returns (bytes32) {
        // todo: create node with action = 'Solve'
        bytes32 newNode;
        return newNode;
    }
}

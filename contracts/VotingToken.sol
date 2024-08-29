// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingToken is ERC20 {
    address owner;
    mapping(address => bool) public voters; // map address to voting status.

    address[] voters_addresses; // voters addresses are indexes according to their order in the database.

    address[] candidates_addresses; //  map ids to theirt addresses.

    uint256[] public votingResults; // votingResults[i] = number of votes which candidate i received.

    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(
        address[] memory _voters_addresses,
        address[] memory _candidates_addresses,
        uint256 _durationInMinutes
    ) ERC20("VotingToken", "VTK") {
        _mint(msg.sender, 100 * (10**uint256(decimals())));
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);

        candidates_addresses = _candidates_addresses;

        //initialize the voting results (with 0 in all cells).
        votingResults = new uint256[](_candidates_addresses.length);

        //initialize the voters addresses with the addresses from the db
        voters_addresses = _voters_addresses;
    }

    function giveRightToVote(uint to) public
    { 
        require(owner == msg.sender,'Only owner can tarnsfer tokens to eligible voters.');
        require(owner != voters_addresses[to] ,'Owner cannot transfer money to himself.');
        require(!voters[voters_addresses[to]],'This voter have already voted.');
        require(balanceOf(voters_addresses[to]) == 0, 'This voter already has voting rights.');
        require(balanceOf(msg.sender) >= 2,'Theres no tokens left to give.');
        transfer(voters_addresses[to],1); 
    }
 
    // Function to return the voting status of a given address
    function hasVoted(address voter) public view returns (bool) {
        return voters[voter];
    }
    // Function to return the entire votingResults array
    function getVotingResults() public view returns (uint256[] memory) {
        return votingResults;
    }
    // Function to return the entire votingResults array
    function getCandidateAddresses() public view returns (address[] memory) {
        return candidates_addresses;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function vote(uint256 index) public returns (bool) {
        require(!voters[msg.sender], "You have already voted.");
        voters[msg.sender] = true;
        return transfer(candidates_addresses[index], 1);
    }

    function setVoteResults() public {
        for (uint256 i = 0; i < candidates_addresses.length; i++) {
            votingResults[i] = balanceOf(candidates_addresses[i]);
        }
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }
}

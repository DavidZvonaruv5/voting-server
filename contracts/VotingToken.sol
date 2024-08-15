// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VotingToken is ERC20 {
    address owner;
    mapping(address => bool) public hasVoted; // map address to voting status.

    address[] candidates_addresses; //  map ids to theirt addresses.

    uint256[] public votingResults; // votingResults[i] = number of votes which candidate i received.

    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(
        address[] memory _candidates_addresses,
        uint256 _durationInMinutes
    ) ERC20("VotingToken", "VTK") {
        _mint(msg.sender, 100 * (10**uint256(decimals())));
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);

        candidates_addresses = _candidates_addresses;
        //initialize the voting results.
        for(uint i=0; i<candidates_addresses.length;i++){
            votingResults.push(0);
        }
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function vote(uint256 index) public returns (bool) {
        require(!hasVoted[msg.sender], "You have already voted.");
        hasVoted[msg.sender] = true;
        return transfer(candidates_addresses[index], 1);
    }

    function getVoteResults() public {
        for (uint256 i = 0; i < candidates_addresses.length; i++) {
            votingResults.push(balanceOf(candidates_addresses[i]));
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

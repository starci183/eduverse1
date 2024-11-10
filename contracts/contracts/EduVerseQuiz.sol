// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct EduVerseQuizParams {
    //questionUri
    string questionUri;
    //all results
    uint8[] results;
    //token address
    address tokenAddress;
    //token amount
    uint256 tokenAmount;
    //startDate
    uint256 startDate;
    //endDate
    uint256 endDate;
}

contract EduVerseQuiz is Ownable {
    // Public string to store the URI for quiz questions (off-chain data)
    string public questionUri;

    // Private array to store the results of the quiz
    uint8[] private results;

    //Max score
    uint8 public maxScore = 10;

    //Token address in pool
    address public tokenAddress;

    //Initial pool size, the tokenAmount
    uint256 public poolSize;

    //Start date
    uint256 public startDate;

    //End date
    uint256 public endDate;

    // Users who have answered the quiz
    mapping(address => uint8) public answeredUsers;

    // Constructor to set the URI at deployment
    constructor(EduVerseQuizParams memory params) Ownable(msg.sender) {
        questionUri = params.questionUri;
        results = params.results;
        tokenAddress = params.tokenAddress;
        poolSize = params.tokenAmount;
        startDate = params.startDate;
        endDate = params.endDate;
    }

    // Function to update the URI (optional, if you'd like to allow changing it)
    function updateQuestionUri(string memory _newUri) public {
        questionUri = _newUri;
    }

    event Answered(address indexed user, uint8 score);

    //answer, send an array of answers, write 
    function answer(uint8[] memory _answers) public {
        require(_answers.length == results.length, "Invalid answers length");
        uint8 score = 0;
        for (uint8 i = 0; i < _answers.length; i++) {
            if (_answers[i] == results[i]) {
                score++;
            }
        }
        require(score <= maxScore, "Invalid score");
        answeredUsers[msg.sender] = score;
        emit Answered(msg.sender, score);
    }

    //claim, claim the reward
    function claim() public {
        require(answeredUsers[msg.sender] > 0, "No answer");
        //send reward
        //get balance
        uint256 balance = ERC20(tokenAddress).balanceOf(address(this));
        IERC20(tokenAddress).transfer(msg.sender, balance);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./EduVerseQuiz.sol";

struct CreateEduVerseQuizParams {
    //questionUri
    string questionUri;
    //all results
    uint8[] results;
    //token address
    address tokenAddress;
    //token amount
    uint256 tokenAmount;
    //start date
    uint256 startDate;
    //end date
    uint256 endDate;
}

contract EduVerseQuizFactory {
    // Constructor to set the URI at deployment
    constructor() {
    }

    // Function to update the URI (optional, if you'd like to allow changing it)
    function createEduVerseQuiz(CreateEduVerseQuizParams memory params) public {
        EduVerseQuiz quiz = new EduVerseQuiz(EduVerseQuizParams({
            questionUri: params.questionUri,
            results: params.results,
            tokenAddress: params.tokenAddress,
            tokenAmount: params.tokenAmount,
            startDate: params.startDate,
            endDate: params.endDate
        }));
        //transfer token
        IERC20(params.tokenAddress).transfer(address(quiz), params.tokenAmount);
        emit EduVerseQuizCreated(address(quiz));
    }

    event EduVerseQuizCreated(address indexed quizAddress);
}
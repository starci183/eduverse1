import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // Get the contract to deploy
  const EduVerseQuizFactory = await hre.ethers.getContractFactory("EduVerseQuizFactory");

  const eduVerseQuizFactory = await EduVerseQuizFactory.deploy();

  await eduVerseQuizFactory.waitForDeployment();

  console.log("EduVerseQuizFactory deployed to:", eduVerseQuizFactory.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Run the script with: npx hardhat run scripts/deployAnonymousFeedback.ts --network bnb
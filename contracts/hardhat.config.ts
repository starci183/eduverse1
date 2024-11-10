import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || "";
console.log("PrivateKey set:", !!ACCOUNT_PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    artifacts: "./src",
  },
  networks: {
    bnb: {
      url: "https://open-campus-codex-sepolia.drpc.org",
      chainId: 656476,
      accounts: ["0xa5ab5f898856fdc63282e647902ef674e0d2159be10bd80390c4a4b71ebea530"]
    }
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      opencampus: "xxx",
    },
    customChains: [
      {
        network: "opencampus",
        chainId: 656476,
        urls: {
          apiURL: "https://edu-chain-testnet.blockscout.com/api/",
          browserURL: "opencampus-codex.blockscout.com",
        },
      },
    ],
  },
};

export default config;

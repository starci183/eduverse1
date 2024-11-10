import { KeyPair } from "near-api-js"
import { ChainAccount } from "../common"
import { CreateAccountParams, ImportAccountParams } from "./types.creation"
import { parseSeedPhrase } from "near-seed-phrase"
import { KeyPairString } from "near-api-js/lib/utils"
import { BasePeripherySpecialApiService } from "../../periphery"
import { defaultNetwork, envConfig } from "@/config"

export const createNearAccount = async ({
    accountNumber,
    mnemonic,
    subdomain,
    network,
}: Omit<CreateAccountParams, "chainKey">): Promise<ChainAccount> => {
    if (!subdomain) throw new Error("Subdomain is required for creating a Near account")
    network = network || defaultNetwork

    const { secretKey, publicKey } = parseSeedPhrase(
        mnemonic,
        `m/44'/397'/0'/${accountNumber}'`
    )
    //call to near api to create account
    const api = new BasePeripherySpecialApiService()
    const { transactionHash } = await api.createNearAccount({
        subdomain,
        publicKey,
        //our default network is testnet
        network,
    })
    console.log("transactionHash", transactionHash)
    
    return {
        address: makeNearAccountId(subdomain),
        privateKey: secretKey,
        publicKey,
    }
}

export const importNearAccount = ({
    privateKey,
}: Omit<ImportAccountParams, "chainKey">): ChainAccount => {
    const keyPair = KeyPair.fromString(privateKey as KeyPairString)
    return {
        address: keyPair.getPublicKey().toString(),
        privateKey: privateKey,
        publicKey: keyPair.getPublicKey().toString(),
    }
}

export const makeNearAccountId = (subdomain: string) => {
    return `${subdomain}.${envConfig().nearAccountIds[defaultNetwork]}`
}
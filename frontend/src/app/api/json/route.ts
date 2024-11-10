"server only"
import PinataSDK, { PinataPinOptions } from "@pinata/sdk"
import "@/config/server-env.config"
import { NextRequest, NextResponse } from "next/server"
import { v4 } from "uuid"

export const POST = async (request: NextRequest) => {
    const json = await request.json()
    const pinata = new PinataSDK({
        pinataApiKey: "d8bddbf353a38a4fc66e",
        pinataSecretApiKey: "aae0c5ab4164784b45b5294eac7a26d7cf84265061cfd56ed508a623a89656c0"
    })
    const options: PinataPinOptions = {
        pinataMetadata: {
            name: v4(),
        },
        pinataOptions: {
            cidVersion: 0,
        },
    }
    const { IpfsHash } = await pinata.pinJSONToIPFS(json, options)
    const data = {
        url: `https://violet-lazy-yak-333.mypinata.cloud/ipfs/${IpfsHash}`
    }
    return NextResponse.json(data)
}
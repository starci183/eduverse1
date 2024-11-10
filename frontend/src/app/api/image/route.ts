import PinataSDK, { PinataPinOptions } from "@pinata/sdk"
import { NextRequest, NextResponse } from "next/server"
import { v4 } from "uuid"
import { Readable } from "stream"

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const readableStream = Readable.from(buffer)
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
    if (!file) throw new Error("No file found in request")
    const { IpfsHash } = await pinata.pinFileToIPFS(readableStream, options)
    const data = {
        url: `https://violet-lazy-yak-333.mypinata.cloud/ipfs/${IpfsHash}`
    }
    return NextResponse.json(data)
}
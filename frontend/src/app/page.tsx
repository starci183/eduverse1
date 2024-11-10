"use client"
import React from "react"

import { useOCAuth } from "@opencampus/ocid-connect-js"
import { Button, Image } from "@nextui-org/react"
import { useSDK } from "@metamask/sdk-react"
const Page = () => {
    const { ocAuth } = useOCAuth()
    const { sdk, account } = useSDK()

    const handleLogin = async () => {
        try {
            await ocAuth.signInWithRedirect({ state: "opencampus" })
        } catch (error) {
            console.error("Login error:", error)
        }
    }
    
    return (
        <div className="w-full h-screen grid place-items-center">
            <div className="grid gap-4 place-items-center">
                <div className="grid gap-4">
                    {
                        !account ? (
                            <Button className="w-[300px]" size="lg" variant="flat" startContent={<Image src="/icons/metamask.png" className="w-6 h-6"/>} onClick={async () => await sdk?.connect()}>Connect Wallet</Button>
                        ) : (
                            <Button className="w-[300px]"  size="lg" variant="flat" startContent={<Image src="/icons/metamask.png" className="w-6 h-6"/>} onClick={async () => await sdk?.disconnect()}>Disconnect Wallet</Button>
                        )
                    }
                    <Button className="w-[300px]"  isDisabled={!account} color="primary" size="lg" variant="flat" startContent={<Image src="/icons/logo.png" className="w-6 h-6"/>} onClick={handleLogin}>Login</Button>
                </div>
                {
                    account && (
                        <div>
                            <div>Connected Address: {account}</div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Page
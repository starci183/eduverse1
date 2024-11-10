"use client"

import React, { PropsWithChildren, Suspense } from "react"
import { NextUIProvider } from "@nextui-org/react"
import { HooksProvider } from "@/hooks"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/redux"
import { Modals } from "@/components"
import { TestProvider } from "@/tests"
import { ToastContainer } from "@/toasts"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { OCConnect } from "@opencampus/ocid-connect-js"
import { MetaMaskProvider } from "@metamask/sdk-react"

const opts = {
    redirectUri: "http://localhost:3000/redirect", // Adjust this URL
    referralCode: "PARTNER6", // Assign partner code
}

  
export const LayoutContent = ({ children }: PropsWithChildren) => {
    return (
        <Suspense>
            <NextThemesProvider attribute="class" enableSystem>
                <HooksProvider>
                    <MetaMaskProvider
                        sdkOptions={{
                            dappMetadata: {
                                name: "Example React Dapp",
                            },
                        }}
                    >
                        <OCConnect opts={opts} sandboxMode={true}>
                            {children}
                        </OCConnect>
                    </MetaMaskProvider>
                    <Modals />
                    <ToastContainer />
                </HooksProvider>
            </NextThemesProvider>
        </Suspense>
    )
}

export const WrappedLayout = ({ children }: PropsWithChildren) => {
    return (
        <TestProvider isTesting={false}>
            <NextUIProvider>
                <ReduxProvider store={store}>
                    <LayoutContent> {children} </LayoutContent>
                </ReduxProvider>
            </NextUIProvider>
        </TestProvider>
    )
}

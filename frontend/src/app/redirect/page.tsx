"use client"

import React from "react"
import { LoginCallBack, useOCAuth } from "@opencampus/ocid-connect-js"
import { useRouter } from "next/navigation"
import { Spinner } from "@nextui-org/react"

const Page = () => {
    const router = useRouter()

    const loginSuccess = () => {
        router.push("/auth/success") // Redirect after successful login
    }
  
    const loginError = (error: unknown) => {
        console.error("Login error:", error)
    }
  
    const CustomErrorComponent = () => {
        const { authState } = useOCAuth()
        return <div>Error Logging in: {authState.error?.message}</div>
    }
  
    const CustomLoadingComponent = () => {
        return (
            <div className="w-full h-screen grid place-items-center">
                <Spinner size="lg" label="Loading..." />
            </div>
        )
    }
  
    return (
        <LoginCallBack 
            errorCallback={loginError} 
            successCallback={loginSuccess}
            customErrorComponent={<CustomErrorComponent />}
            customLoadingComponent={<CustomLoadingComponent />} 
        />
    )
}

export default Page

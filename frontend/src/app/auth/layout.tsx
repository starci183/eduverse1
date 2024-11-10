"use client"

import React from "react"
import { CustomNavbar } from "@/components/Navbar"
import { PropsWithChildren } from "react"

const Layout = ({ children }: PropsWithChildren) => {
    return (
        <div>
            <CustomNavbar />
            {children}
        </div>
    )
} 
export default Layout
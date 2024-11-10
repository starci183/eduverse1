"use client"
import { useSDK } from "@metamask/sdk-react"
import { useOCAuth } from "@opencampus/ocid-connect-js"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react"
import React from "react"

export const CustomNavbar = () => {
    const { account } = useSDK()
    const { ocAuth } = useOCAuth()

    return (
        <Navbar position="static">
            <NavbarBrand>
                <p className="font-bold text-inherit">Eduverse</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link color="foreground" href="#">
            Features
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link href="#" aria-current="page">
            Customers
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#">
            Integrations
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Link color="primary" href="#">{ocAuth.getAuthState().OCId}</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#">{account?.slice(0, 6)}...{account?.slice(-3)}</Link>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}
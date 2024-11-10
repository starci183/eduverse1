import { useDisclosure } from "@nextui-org/react"
import { UseDisclosureReturn } from "@nextui-org/use-disclosure"
import { useModals } from "."

export const _useBridgeWrapSelectTokenModalDisclosure = () : UseDisclosureReturn => {
    return useDisclosure()
}

export const useBridgeWrapSelectTokenModalDisclosure = () : UseDisclosureReturn => {
    const { bridgeWrapSelectTokenModalDisclosure } = useModals()
    return bridgeWrapSelectTokenModalDisclosure
}




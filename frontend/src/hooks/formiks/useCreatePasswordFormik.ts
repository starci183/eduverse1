import { FormikProps, useFormik } from "formik"
import * as Yup from "yup"
import { useFormiks } from "."
import { constantConfig } from "@/config"
import { setPassword, useAppDispatch, useAppSelector } from "@/redux"
import { BaseAccounts, createAccount, makeNearAccountId, nearClient, saveEncryptedBaseAccounts, saveEncryptedMnemonic } from "@/services"
import { useRouterWithSearchParams } from "../miscellaneous"

export interface CreatePasswordFormikValues {
    password: string;
}

export const _useCreatePasswordFormik = (): FormikProps<CreatePasswordFormikValues> => {

    const router = useRouterWithSearchParams()

    const mnemonic = useAppSelector((state) => state.authReducer.mnemonic)
    const dispatch = useAppDispatch()

    const initialValues: CreatePasswordFormikValues = {
        password: "",
    }

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
    })

    const chains = useAppSelector((state) => state.blockchainReducer.chains)
    const chainKeys = Object.keys(chains)
    const network = useAppSelector((state) => state.blockchainReducer.network)

    const username = useAppSelector((state) => state.authReducer.telegramInfo.username)

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async ({ password }) => {
            saveEncryptedMnemonic({
                mnemonic,
                password
            })
            const baseAccounts : BaseAccounts = {}

            //queries conitnue until got valid username
            let subdomain = ""
            let index = 0
            for(;;) {
                try {
                    const client = await nearClient(network)
                    subdomain = index > 0 ? `${username}${index}` : username
                    const account = await client.account(makeNearAccountId(subdomain))
                    await account.state()
                    //if no error, mean that accountId is existed, continue to next index
                    index++
                } catch {
                    //error mean that accountId is not existed, break the loop
                    break
                }      
            }

            console.log("subdomain", subdomain)
            //create session here
            for (const chainKey of chainKeys) {
                //create account
                const { address, privateKey, publicKey} = await createAccount({
                    mnemonic,
                    accountNumber: 0,
                    chainKey,
                    subdomain,
                    network
                })

                baseAccounts[chainKey] = {
                    accounts: {
                        [privateKey]: {
                            name: "User",
                            imageUrl: "",
                            accountAddress: address,
                            publicKey: publicKey,
                            accountNumber: 0,
                        }
                    },
                    activePrivateKey: privateKey,
                }
            }
            saveEncryptedBaseAccounts({
                baseAccounts,
                password
            })
            dispatch(setPassword(password))
            router.push(constantConfig().path.home)
        },
    })

    return formik
}

export const useCreatePasswordFormik = () => {
    const { createPasswordFormik } = useFormiks()
    return createPasswordFormik
}
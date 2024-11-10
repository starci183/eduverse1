"use client"
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import React from "react"

const Page = () => {
    const router = useRouter()

    return (
        <div className="w-full h-screen grid place-items-center">
            <div className="flex gap-4">
                <Card onPress={() => router.push("/auth/create-quiz")} isPressable className="w-[300px]">
                    <CardBody>
                        <Image src="/icons/robo.svg" width={200} />
                    </CardBody>
                    <CardFooter>
                        <div>
                            <div>Create Quiz</div>
                        </div>
                    </CardFooter>
                </Card>
                <Card isPressable className="w-[300px]">
                    <CardBody>
                        <Image src="/icons/investment.svg" width={200} />
                    </CardBody>
                    <CardFooter>
                        <div>
                            <div>Learn & Earn</div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Page
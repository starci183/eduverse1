"use client"
import {
    Tabs,
    Tab,
    Spacer,
    Input,
    Image,
    DateInput,
    Textarea,
    Button,
    Accordion,
    AccordionItem,
} from "@nextui-org/react"
import { useFormik } from "formik"
import {
    now,
    getLocalTimeZone,
    parseAbsoluteToLocal,
} from "@internationalized/date"
import React, { useState } from "react"
import * as Yup from "yup"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { OpenAI } from "openai"
import useSWRMutation from "swr/mutation"
import { useSDK } from "@metamask/sdk-react"
import { factoryAbi } from "./abi"
import { computeRaw } from "@/utils"
import web3, { Web3 } from "web3"

const Page = () => {
    const openai = new OpenAI({
        apiKey: process.env.KEY,
    })

    const getChatCompletion = async (
        messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam>
    ) => {
        try {
            // Call the chat completion endpoint
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // You can change this to "gpt-3.5-turbo" if you prefer
                messages,
            })

            // Extract and return the response message
            return response.choices[0].message.content
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            return `Error: ${error.message}`
        }
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            startDate: now(getLocalTimeZone()).toAbsoluteString(),
            endDate: now(getLocalTimeZone()).toAbsoluteString(),
            coverImage: "",
            description: "",
            tokenAddress: "",
            tokenAmount: 0,
            typeContent: "",
            generatedContent: "",
            quiz: [
                {
                    question: "",
                    answer1: "",
                    answer2: "",
                    answer3: "",
                    answer4: "",
                    correctAnswer: "",
                },
            ],
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            startDate: Yup.date().required("Start date is required"),
            endDate: Yup.date()
                .min(Yup.ref("startDate"), "End date must be later than start date")
                .required("End date is required"),
            coverImage: Yup.mixed().required("Cover image is required"),
            description: Yup.string().required("Start description is required"),
            tokenAddress: Yup.string().required("Token address is required"),
            tokenAmount: Yup.number()
                .positive("Token amount must be a positive number")
                .required("Token amount is required"),
            quiz: Yup.array().of(
                Yup.object().shape({
                    question: Yup.string().required("Question is required"),
                    answer1: Yup.string().required("Answer 1 is required"),
                    answer2: Yup.string().required("Answer 2 is required"),
                    answer3: Yup.string().required("Answer 3 is required"),
                    answer4: Yup.string().required("Answer 4 is required"),
                    correctAnswer: Yup.string().required("Select correct answer"),
                })
            ),
        }),
        onSubmit: (values) => {
            console.log(values)
        },
    })
    const { provider, account } = useSDK()

    const swr = useSWRMutation("CALL", async () => {
        if (!provider) return null
        const _provider = new web3.providers.HttpProvider("https://open-campus-codex-sepolia.drpc.org")
        const _web3 = new Web3(_provider)
        const contract = new _web3.eth.Contract(factoryAbi, "0x12cCB2F6a44F336f1fA9DA3b2d6BD357b993d4EE", _web3)

        const json = JSON.parse(formik.values.generatedContent) as Array<Question>
        //get answer array
        const answers = json.map((item) => item.answer)
        //remove answer from question
        const questions = json.map((item) => {
            delete item.answer
            return item
        })
        const { data } = await axios.post(
            "http://localhost:5555/api/v1/packages/test2",
            questions
        )

        return await contract.methods.createEduVerseQuiz({
            questionUri: data.url,
            results: answers,
            tokenAddress: formik.values.tokenAddress,
            tokenAmount: computeRaw(formik.values.tokenAmount, 18),
            startDate: parseAbsoluteToLocal(formik.values.startDate)
                .toDate()
                .getTime(),
            endDate: parseAbsoluteToLocal(formik.values.endDate).toDate().getTime(),
        }).send({ from: account })
    })

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const formData = new FormData()
            formData.append("file", acceptedFiles[0])
            const { data } = await axios.post(
                "http://localhost:5555/api/v1/packages/test",
                formData,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data", // Important to specify multipart/form-data
                    },
                }
            )
            console.log(data)
            formik.setFieldValue("coverImage", data.url)
        },
    })

    const [step, setStep] = useState(1)

    const removeFirstAndLastLine = (inputString: string) => {
    // Split the string into an array of lines
        const lines = inputString.split("\n")

        // Remove the first and last lines
        lines.shift() // Remove first line
        lines.pop() // Remove last line

        // Join the remaining lines back together and return the result
        return lines.join("\n")
    }

    const genSwr = useSWRMutation("GENERATE", async () => {
        const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [
          { role: "system", content: "You are a helpful assistant." },
          {
              role: "user",
              content: `based on this - help me to create 10 multichoice (4 options) quiz, respond me one json file, question id, option, answer 0123, only json file, no need to say anything else please - ${formik.values.typeContent}`,
          },
      ]
        const generatedContent = await getChatCompletion(messages)
        if (!generatedContent) {
            return
        }
        formik.setFieldValue(
            "generatedContent",
            removeFirstAndLastLine(generatedContent)
        )
    })
    return (
        <div className="grid grid place-items-center">
            <Spacer y={12} />
            <Tabs
                classNames={{
                    tabList: "w-[600px]",
                }}
                className="w-[600px]"
                selectedKey={step.toString()}
                onSelectionChange={(key) => setStep(Number(key))}
            >
                <Tab key={1} title={"Course Information"}>
                    <Spacer y={6} />
                    <div className="w-[600px]">
                        <Input
                            label="Course name"
                            id="name"
                            value={formik.values.name}
                            labelPlacement="outside"
                            required
                            onChange={formik.handleChange}
                            placeholder="Enter course name"
                            onBlur={formik.handleBlur}
                            isInvalid={!!(formik.touched.name && formik.errors.name)}
                            errorMessage={formik.touched.name && formik.errors.name}
                        />
                        <Spacer y={4} />
                        <div className="flex gap-4">
                            <DateInput
                                label="Start date"
                                id="startDate"
                                value={parseAbsoluteToLocal(formik.values.startDate)}
                                labelPlacement="outside"
                                onChange={(value) =>
                                    formik.setFieldValue("startDate", value.toAbsoluteString())
                                }
                                onBlur={formik.handleBlur}
                                isInvalid={
                                    !!(formik.touched.startDate && formik.errors.startDate)
                                }
                            />
                            <DateInput
                                label="End date"
                                id="endDate"
                                value={parseAbsoluteToLocal(formik.values.endDate)}
                                labelPlacement="outside"
                                onChange={(value) =>
                                    formik.setFieldValue("endDate", value.toAbsoluteString())
                                }
                                onBlur={formik.handleBlur}
                                isInvalid={!!(formik.touched.endDate && formik.errors.endDate)}
                            />
                        </div>
                        <Spacer y={4} />
                        <div className="text-sm">Upload Cover Image</div>
                        <Spacer y={1.5} />
                        <div
                            className="h-[100px] rounded-medium border border-dashed p-4"
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the files here ...</p>
                            ) : (
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            )}
                        </div>
                        {formik.values.coverImage && (
                            <>
                                <Spacer y={4} />
                                <Image
                                    src={formik.values.coverImage}
                                    alt="coverImage"
                                    className="w-[200px]"
                                />
                            </>
                        )}
                        <Spacer y={4} />
                        <Textarea
                            label="Course Description"
                            id="description"
                            value={formik.values.description}
                            labelPlacement="outside"
                            required
                            onChange={formik.handleChange}
                            placeholder="Enter course description"
                            onBlur={formik.handleBlur}
                            isInvalid={
                                !!(formik.touched.description && formik.errors.description)
                            }
                            errorMessage={
                                formik.touched.description && formik.errors.description
                            }
                        />
                    </div>
                    <Spacer y={12} />
                </Tab>
                <Tab key={2} title={"Bounty"}>
                    <Spacer y={6} />
                    <div className="w-[600px]">
                        <Input
                            label="Token address"
                            id="tokenAddress"
                            value={formik.values.tokenAddress}
                            labelPlacement="outside"
                            required
                            onChange={formik.handleChange}
                            placeholder="Enter token address"
                            onBlur={formik.handleBlur}
                            isInvalid={
                                !!(formik.touched.tokenAddress && formik.errors.tokenAddress)
                            }
                            errorMessage={
                                formik.touched.tokenAddress && formik.errors.tokenAddress
                            }
                        />
                        <Spacer y={4} />
                        <Input
                            label="Token amount"
                            id="tokenAmount"
                            value={formik.values.tokenAmount.toString()}
                            labelPlacement="outside"
                            required
                            onChange={formik.handleChange}
                            placeholder="Enter token amount"
                            onBlur={formik.handleBlur}
                            isInvalid={
                                !!(formik.touched.tokenAmount && formik.errors.tokenAmount)
                            }
                            errorMessage={
                                formik.touched.tokenAmount && formik.errors.tokenAmount
                            }
                        />
                        <Spacer y={12} />
                    </div>
                </Tab>
                <Tab key={3} title={"AI"}>
                    <Spacer y={6} />
                    <div className="w-[600px]">
                        <Textarea
                            label="Course content"
                            id="typeContent"
                            value={formik.values.typeContent}
                            labelPlacement="outside"
                            required
                            onChange={formik.handleChange}
                            placeholder="Enter course content"
                            onBlur={formik.handleBlur}
                            isInvalid={
                                !!(formik.touched.typeContent && formik.errors.typeContent)
                            }
                            errorMessage={
                                formik.touched.typeContent && formik.errors.typeContent
                            }
                        />
                        <Spacer y={4} />
                        <Button
                            color="primary"
                            isLoading={genSwr.isMutating}
                            onPress={async () => {
                                await genSwr.trigger()
                            }}
                        >
                            {" "}
                            {genSwr.isMutating ? "Generating..." : "Generate"}{" "}
                        </Button>
                        <Spacer y={4} />
                        {formik.values.generatedContent && (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            <>
                                <Accordion>
                                    {JSON.parse(formik.values.generatedContent).map(
                                        (item: Question) => (
                                            <AccordionItem
                                                key={item.question_id}
                                                aria-label="Accordion 1"
                                                subtitle="Press to expand"
                                                title={item.question}
                                            >
                                                {item.options.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className={`${item.answer === index ? "text-success" : ""}`}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </AccordionItem>
                                        )
                                    )}
                                </Accordion>
                                <Spacer y={4} />
                                <Button
                                    color="primary"
                                    isLoading={swr.isMutating}
                                    onPress={async () => await swr.trigger()}
                                >
                                    {" "}
                  Create{" "}
                                </Button>
                            </>
                        )}
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}
export default Page

type Question = {
  question_id: number;
  question: string;
  options: string[];
  answer?: number;
};

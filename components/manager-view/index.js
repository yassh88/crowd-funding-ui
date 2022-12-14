import { Button, Loading, Modal, Input, useNotification } from "@web3uikit/core"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../../constants"

export default function ManagerView() {
  const dispatch = useNotification()
  const [isVisible, setVisible] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [requestCount, setRequestsCount] = useState(0)
  const [recipient, setRecipient] = useState(
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  )
  const [amount, setAmount] = useState(ethers.utils.parseEther("0.5"))
  const [description, setDescription] = useState("")
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()

  const chainId = parseInt(chainIdHex)
  const crowdFundingAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null

  const { runContractFunction: createRequest, data: enterTxResponse } =
    useWeb3Contract()
  const { runContractFunction: getCountRequests } = useWeb3Contract({
    abi: abi,
    contractAddress: crowdFundingAddress,
    chainId: 31337,
    functionName: "getCountRequests",
    params: {},
  })

  useEffect(() => {
    ;(async () => {
      if (enterTxResponse) {
        console.log("enterTxResponse", enterTxResponse)
        const txReceipt = await enterTxResponse.wait(1)
        console.log("txReceipt", txReceipt)
        console.log("txReceipt.events", txReceipt.events)
        if (
          txReceipt.events[0].args.value &&
          txReceipt.events[0].args.recipient
        ) {
          console.log(txReceipt.events[0].args.value.toString())
          console.log(txReceipt.events[0].args.recipient.toString())
          handleNewNotification("success", `Request is created`)
        } else {
          handleNewNotification("error", `Error while creating request`)
        }
        setLoading(false)
      }
    })()
  }, [enterTxResponse])
  const handleNewNotification = (type, message) => {
    dispatch({
      type,
      message,
      title: "New Notification",
      icon: undefined,
      position: "topR",
    })
  }
  const {
    runContractFunction: finalizeRequest,
    data: enterFinalizeRequestTxResponse,
  } = useWeb3Contract()
  useEffect(() => {
    ;(async () => {
      if (enterFinalizeRequestTxResponse) {
        console.log(
          "enterFinalizeRequestTxResponse",
          enterFinalizeRequestTxResponse
        )
        const txReceipt = await enterFinalizeRequestTxResponse.wait(1)
        console.log("txReceipt", txReceipt)
        console.log("txReceipt.events", txReceipt.events)
        if (txReceipt.events[0].args.recipent) {
          console.log(txReceipt.events[0].args.recipent.toString())
          handleNewNotification(
            "success",
            `You have successfully finalize request`
          )
        } else {
          handleNewNotification("error", `Error while finalize request`)
        }
      }
    })()
  }, [enterFinalizeRequestTxResponse])
  const options = {
    abi: abi,
    contractAddress: crowdFundingAddress,
    functionName: "createRequest",
    chainId: 31337,
    params: {
      _discription: description,
      _value: amount,
      _recipent: recipient,
    },
  }
  const getFinalizeOptions = (_index) => {
    return {
      abi: abi,
      contractAddress: crowdFundingAddress,
      functionName: "finalizeRequest",
      chainId: 31337,
      params: {
        _index,
      },
    }
  }
  const getCountRequestsUI = async () => {
    const reCount = await getCountRequests()
    console.log("reCount", reCount)
    setRequestsCount(reCount)
    handleNewNotification("success", `Request count is ${reCount}`)
  }
  const renderRequests = () => {
    const requests = []
    for (let index = requestCount; index > 0; index--) {
      requests.push(
        <Button
          theme="secondary"
          type="button"
          onClick={() =>
            finalizeRequest({ params: getFinalizeOptions(index - 1) })
          }
          text={`Finalize Request ${index}`}
        />
      )
    }
    return requests
  }
  const renderModal = () => (
    <Modal
      cancelText="Discard Changes"
      id="regular"
      isVisible={isVisible}
      okText="Save Changes"
      onCancel={() => setVisible(!isVisible)}
      onCloseButtonPressed={() => setVisible(!isVisible)}
      onOk={() => {
        setLoading(true)
        createRequest({ params: options })
        setVisible(false)
      }}
      title={<div style={{ display: "flex", gap: 10 }}>Create Request</div>}
    >
      <div
        style={{
          padding: "20px 0 20px 0",
        }}
      >
        <Input
          label="Recipient Address "
          width="100%"
          onChange={(e) => setRecipient(e.target.value)}
          value={recipient}
        />
        <Input
          label="Amount"
          onChange={(e) => setAmount(e.target.value)}
          width="100%"
          value={amount}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          width="100%"
        />
      </div>
    </Modal>
  )
  if (isLoading) {
    return <Loading />
  }
  return (
    <nav className="p-5 flex flex-col">
      <div className="border-b-2 flex p-5 w-max">
        <Button
          theme="primary"
          type="button"
          onClick={() => setVisible(!isVisible)}
          text="Create Request "
        />
        <Button
          theme="primary"
          type="button"
          onClick={() => getCountRequestsUI()}
          text={`Get Finalize Request`}
        />
      </div>
      <div>
        <div class="flex p-5 justify-items-start ">{renderRequests()}</div>
      </div>
      {renderModal()}
    </nav>
  )
}

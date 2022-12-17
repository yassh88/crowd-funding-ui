import { Button, Loading, Modal, Input, useNotification } from "@web3uikit/core"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../../constants"

export default function ContributorView() {
  const dispatch = useNotification()
  const [isVisible, setVisible] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [requestCount, setRequestsCount] = useState(0)
  const [amount, setAmount] = useState(ethers.utils.parseEther("0.2"))
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const crowdFundingAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const optionsForContribute = {
    abi: abi,
    contractAddress: crowdFundingAddress,
    functionName: "contribute",
    chainId: 31337,
    msgValue: amount,
  }

  const { runContractFunction: contribute, data: enterTxResponse } =
    useWeb3Contract()
  const {
    runContractFunction: approveRequest,
    data: enterApproveRequestTxResponse,
  } = useWeb3Contract()
  const { runContractFunction: getCountRequests } = useWeb3Contract({
    abi: abi,
    contractAddress: crowdFundingAddress,
    chainId: 31337,
    functionName: "getCountRequests",
    params: {},
  })
  const handleNewNotification = (type, message) => {
    dispatch({
      type,
      message,
      title: "New Notification",
      icon: undefined,
      position: "topR",
    })
  }
  useEffect(() => {
    ;(async () => {
      if (enterTxResponse) {
        console.log("enterTxResponse", enterTxResponse)
        const txReceipt = await enterTxResponse.wait(1)
        console.log("txReceipt", txReceipt)
        console.log("txReceipt.events", txReceipt.events)
        if (
          txReceipt.events[0].args.contributer &&
          txReceipt.events[0].args.amount
        ) {
          console.log(txReceipt.events[0].args.contributer.toString())
          console.log(txReceipt.events[0].args.amount.toString())
          handleNewNotification("success", `You have successfully contributed`)
        } else {
          handleNewNotification("error", `Error while contributing`)
        }
      }
    })()
  }, [enterTxResponse])

  useEffect(() => {
    ;(async () => {
      if (enterApproveRequestTxResponse) {
        console.log(
          "enterApproveRequestTxResponse",
          enterApproveRequestTxResponse
        )
        const txReceipt = await enterApproveRequestTxResponse.wait(1)
        console.log("txReceipt", txReceipt)
        console.log("txReceipt.events", txReceipt.events)
        if (txReceipt.events[0].args.approver) {
          console.log(txReceipt.events[0].args.approver.toString())
          handleNewNotification(
            "success",
            `You have successfully approved request`
          )
        } else {
          handleNewNotification("error", `Error while approved request`)
        }
      }
    })()
  }, [enterApproveRequestTxResponse])

  const getCountRequestsUI = async () => {
    const reCount = await getCountRequests()
    console.log("reCount", reCount)
    setRequestsCount(reCount)
  }
  const getApproveRequestOptions = (_index) => {
    return {
      abi: abi,
      contractAddress: crowdFundingAddress,
      functionName: "approveRequest",
      chainId: 31337,
      params: {
        _index,
      },
    }
  }
  const renderRequests = () => {
    const requests = []
    for (let index = requestCount; index > 0; index--) {
      requests.push(
        <Button
          theme="secondary"
          type="button"
          onClick={() =>
            approveRequest({
              params: getApproveRequestOptions(index - 1),
              onError: (error) => {
                handleNewNotification("error", `Error while approved request`)
                console.log(error)
              },
            })
          }
          text={`Approve Request ${index}`}
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
        contribute({ params: optionsForContribute })
        setVisible(false)
      }}
      title={<div style={{ display: "flex", gap: 10 }}>Contribute</div>}
    >
      <div
        style={{
          padding: "20px 0 20px 0",
        }}
      >
        <Input
          label="Amount"
          onChange={(e) => setAmount(e.target.value)}
          width="100%"
          value={amount}
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
          text="Contribute "
        />
        <Button
          theme="primary"
          type="button"
          onClick={() => getCountRequestsUI()}
          text={`Get Request for approve`}
        />
      </div>
      <div>
        <div class="flex p-5 justify-items-start ">{renderRequests()}</div>
      </div>
      {renderModal()}
    </nav>
  )
}

// c1 => 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// c2 => 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

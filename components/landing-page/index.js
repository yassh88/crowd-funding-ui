import { Loading } from "@web3uikit/core"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useState, useEffect } from "react"
import { contractAddresses, abi } from "../../constants"
import ManagerView from "../manager-view"

export default function LandingPage() {
  const [manager, setManager] = useState("a")
  const {
    user,
    isWeb3Enabled,
    isInitialized,
    chainId: chainIdHex,
    account,
  } = useMoralis()

  console.log("user", user)
  console.log("account", account)
  const chainId = parseInt(chainIdHex)
  const crowdFundingAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null
  async function updateUIValues() {
    const manager = await getManger()
    console.log("manager", manager)
    setManager(manager)
  }
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues()
    }
  }, [isWeb3Enabled])
  const { runContractFunction: getManger } = useWeb3Contract({
    abi: abi,
    contractAddress: crowdFundingAddress,
    functionName: "getManger",
    params: {},
  })

  const getView = () => {
    if (manager && account && account.toLowerCase() === manager.toLowerCase()) {
      return <ManagerView />
    } else if (!manager || !account) {
      return <Loading />
    } else {
      return "welcome contributor"
    }
  }
  return <div className="p-5 border-b-2 flex flex-row">{getView()}</div>
}

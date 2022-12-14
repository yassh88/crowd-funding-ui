import { Button, Modal, Input } from "@web3uikit/core"
import { useState } from "react"
import { ethers } from "ethers"

export default function ManagerView() {
  const [isVisible, setVisible] = useState(false)
  const amount = ethers.utils.parseEther("0.5")
  return (
    <nav className="p-5 flex ">
      <Button
        theme="primary"
        type="button"
        onClick={() => setVisible(!isVisible)}
        text="Create Request "
      />
      <Button theme="primary" type="button" text="Finalize Request " />
      <Modal
        cancelText="Discard Changes"
        id="regular"
        isVisible={isVisible}
        okText="Save Changes"
        onCancel={() => setVisible(!isVisible)}
        onCloseButtonPressed={() => setVisible(!isVisible)}
        onOk={() => setVisible(!isVisible)}
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
            value="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
          />
          <Input label="Amount" width="100%" value={amount} />
          <Input label="Description" width="100%" />
        </div>
      </Modal>
    </nav>
  )
}

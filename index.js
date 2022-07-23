import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connect-btn")
const fundButton = document.getElementById("fund-btn")
const balanceButton = document.getElementById("balance-btn")
const withdrawButton = document.getElementById("withdraw-btn")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({
            //ethereum.network is the injected web3 provider/wallet object
            method: "eth_requestAccounts", // connect to the account
        }) //connecting to account
        connectButton.innerHTML = "Connected"
        console.log("Connected!")
    } else {
        connectButton.innerHTML = "No Metamask"
    }
}

//fund function
async function fund() {
    const ethAmount = document.getElementById("eth-amount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        // provider/connection to blockchain
        // signer/wallet
        // contract
        // abi and address
        const provider = new ethers.providers.Web3Provider(window.ethereum) //accessing injected wallet object as provider
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completeted with ${transactionReceipt.confirmations} confirmation(s)`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        // const signer = provider.getSigner()
        // console.log(signer)
        balanceButton.innerText = `Balance = ${ethers.utils.formatEther(
            balance
        )} ETH`
        console.log(ethers.utils.formatEther(balance))
        return balance
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw({
                gasLimit: 100000,
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Funds Withdrawn")
        } catch (error) {
            console.log(error)
        }
    }
}

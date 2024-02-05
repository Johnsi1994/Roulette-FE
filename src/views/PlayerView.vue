<template>
  <div>
    <div class="act">
      <p>Player Balance: {{ playerBalance }} matic</p>
      <button @click="checkBalance">Check balance</button>
    </div>
    <div class="act">
      <p>Deposit</p>
      <input type="number" v-model="depositAmount" />
      <button @click="deposit">Deposit</button>
      <div v-if="depositStaus !== 0">
        <p v-if="depositStaus === 1">Insufficient balance</p>
        <p v-if="depositStaus === 2">Deposit processing ...</p>
        <p v-if="depositStaus === 3">Deposit Success</p>
      </div>
    </div>
    <div class="act">
      <p>Withdraw</p>
      <input type="number" v-model="withdrawAmount" />
      <button @click="withdraw">Withdraw</button>
      <div v-if="withdrawStaus !== 0">
        <p v-if="withdrawStaus === 1">Insufficient balance</p>
        <p v-if="withdrawStaus === 2">Withdraw processing ...</p>
        <p v-if="withdrawStaus === 3">Withdraw Success</p>
      </div>
    </div>
    <div class="act">
      <p>Bet</p>
      <button @click="placeBet">Place Bet</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ethers, formatEther, parseEther, parseUnits } from 'ethers'
import BalanceStatus from '../models/BalanceStatus'
import RouletteABI from '../contract/RouletteABI'

const ALCHEMY_POLYGON_MUMBAI_KEY = import.meta.env.VITE_ALCHEMY_POLYGON_MUMBAI_KEY
const POLYGON_MUMBAI_URL = `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_POLYGON_MUMBAI_KEY}`
const provider = new ethers.JsonRpcProvider(POLYGON_MUMBAI_URL)

const ownerAddr = '0x072740684627190763Ef074b1Bca75E012CE4486'
const player1Addr = '0x327E7BDA7D704585f5BB4fCa2345340786accc8C'

const player1Wallet = new ethers.Wallet(import.meta.env.VITE_PLAYER_1_PRIVATE_KEY, provider)

const addressRoulette = '0xf420439B73fcd04880dA1e892d45aD65B05D2Ac1'
const contractRoulette = new ethers.Contract(addressRoulette, RouletteABI, player1Wallet)

export default defineComponent({
  setup() {
    // get balance
    const playerBalance = ref('--')
    const checkBalance = async () => {
      const balance = await contractRoulette.getBalance(player1Addr)
      playerBalance.value = formatEther(balance)
      console.log(`Player1 Balance: ${playerBalance.value} matic`)
    }

    // deposit
    const depositAmount = ref(0)
    const depositStaus = ref(BalanceStatus.NONE)
    const deposit = async () => {
      // wallet balance
      const balance = await provider.getBalance(player1Addr)
      const amountWei = parseEther(depositAmount.value.toString())
      if (depositAmount.value === 0 || amountWei > balance) {
        depositStaus.value = BalanceStatus.INSUFFICIENT_BALANCE
      } else {
        depositStaus.value = BalanceStatus.PROCESSING
        const tx = await contractRoulette.deposit({ value: amountWei })
        await tx.wait()
        depositStaus.value = BalanceStatus.COMPLETE
      }
      setTimeout(() => {
        depositStaus.value = BalanceStatus.NONE
      }, 5000)
    }

    // listen to deposit event
    contractRoulette.on('DepositSuccess', (player, amount) => {
      console.log(`player ${player} deposit ${formatEther(amount)} success`)
      if (player === player1Addr) {
        checkBalance()
      }
    })

    // withdraw
    const withdrawAmount = ref(0)
    const withdrawStaus = ref(BalanceStatus.NONE)
    const withdraw = async () => {
      const balance = await contractRoulette.getBalance(player1Addr)
      const amount = parseUnits(withdrawAmount.value.toString())
      console.log(`balance ${balance} | amount ${amount}`)
      if (withdrawAmount.value === 0 || amount > balance) {
        withdrawStaus.value = BalanceStatus.INSUFFICIENT_BALANCE
      } else {
        withdrawStaus.value = BalanceStatus.PROCESSING
        const tx = await contractRoulette.withdraw(amount)
        await tx.wait()
        withdrawStaus.value = BalanceStatus.COMPLETE
      }
      setTimeout(() => {
        withdrawStaus.value = BalanceStatus.NONE
      }, 5000)
    }

    // listen to withdraw event
    contractRoulette.on('WithdrawSuccess', (player, amount) => {
      console.log(`player ${player} withdraw ${formatEther(amount)} success`)
      if (player === player1Addr) {
        checkBalance()
      }
    })

    // Place bet
    const placeBet = async () => {
      const bets = [
        {
          betType: 0,
          betNumbers: [1],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [2],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [3],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [4],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [5],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [6],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [7],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [8],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [9],
          betAmount: parseEther('0.01')
        },
        {
          betType: 0,
          betNumbers: [10],
          betAmount: parseEther('0.01')
        },
      ]
      await contractRoulette.placeBet(bets)
    }

    const getBetInfo = async (betId: string) => {
      const betInfo = await contractRoulette.getBetInfo(betId)
      console.log(`BetInfo ${betInfo}`)
    }

    contractRoulette.on('PlaceBetSuccess', (player, betId) => {
      console.log(`Player ${player} place bet success!!\nBet ID: ${betId}`)
      // if (player === player1Addr) {
      //   checkBalance()
      // }
    })

    contractRoulette.on('RequestSent', (requestId, _, betId) => {
      console.log(`Request sent!!\nRequest ID: ${requestId}\nBet ID: ${betId}`)
      getBetInfo(betId)
      // if (player === player1Addr) {
      //   checkBalance()
      // }
    })

    contractRoulette.on('RequestFulfilled', (requestId, randomWords) => {
      console.log(`Request fulfilled!!\nRequest ID: ${requestId}\nWinning number: ${randomWords[0] % 38}`)
      // if (player === player1Addr) {
      //   checkBalance()
      // }
    })

    return {
      playerBalance,
      checkBalance,
      deposit,
      depositStaus,
      depositAmount,
      withdraw,
      withdrawStaus,
      withdrawAmount,
      placeBet
    }
  }
})
</script>

<style scope>
div.act {
  margin: 20px 0px;
}

button {
  color: white;
  background-color: hsla(160, 100%, 37%, 1);
  border: none;
  border-radius: 2px;
  padding: 4px 8px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

button:active {
  background-color: hsla(160, 80%, 37%, 1);
}

input {
  border-color: var(--color-text);
  border-radius: 2px;
  background-color: transparent;
  color: var(--color-text);
  margin: 0px 8px 0px 0px;
}
</style>

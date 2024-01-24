<template>
  <div class="roulette">
    <h1>Roulette</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const connectWallet = () => {
      console.log("connectWallet")
    }

    return { connectWallet }
  }
})
</script>
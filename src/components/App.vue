<template>
  <BaseBackground />
  <BasePlayer
    :state="playerState"
    :capturedFish="capturedFish"
    @animationFinished="onAnimationFinished"
    @showingCaughtFish="onShowingCaughtFish"
  />
  <Hud
    :enableActionButtonTrigger="enableActionButtonTrigger"
    :showCaughtFishTrigger="showCaughtFishTrigger"
    @setPlayerState="onSetPlayerState"
    @setCapturedFish="onSetCapturedFish"
  />
</template>
  
  
<script setup>

export default {
  name: "App"
};

import { ref } from 'vue'

// Componentes base
import BaseBackground from './base_components/BaseBackground.vue'
import BasePlayer from './base_components/BasePlayer.vue'

// Componentes propios
import Hud from './components/Hud.vue'

// Estado y funciones
const playerState = ref('standing')
const capturedFish = ref('')
const enableActionButtonTrigger = ref(0)
const showCaughtFishTrigger = ref(0)

// Manejadores de eventos
function onAnimationFinished() {
  enableActionButtonTrigger.value++
}

function onShowingCaughtFish() {
  showCaughtFishTrigger.value++
}

function onSetPlayerState(newState) {
  playerState.value = newState
}

function onSetCapturedFish(fishId) {
  capturedFish.value = fishId
}
</script>

<style>
img {
    -webkit-user-drag: none;
}
</style>
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
import { ref } from 'vue'

// Componentes base
import BaseBackground from '../base_components/BaseBackground.vue'
import BasePlayer from '../base_components/BasePlayer.vue'

// Componentes propios
import Hud from '../components/Hud.vue'

// Estado del jugador
const playerState = ref('standing')
const capturedFish = ref('')

// Triggers reactivos para el componente Hud
const enableActionButtonTrigger = ref(0)
const showCaughtFishTrigger = ref(0)

// Eventos emitidos por BasePlayer
function onAnimationFinished() {
  enableActionButtonTrigger.value++
}

function onShowingCaughtFish() {
  showCaughtFishTrigger.value++
}

// Eventos emitidos por Hud
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

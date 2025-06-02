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

<script>
import { ref } from 'vue';

// Componentes base
import BaseBackground from '../base_components/BaseBackground.vue'
import BasePlayer from '../base_components/BasePlayer.vue'

// Componentes propios
import Hud from './Hud.vue'


// Triggers reactivos para el componente Hud
export const enableActionButtonTrigger = ref(0)
export const showCaughtFishTrigger = ref(0)

export default {
  name: 'App',
  components: {
    BaseBackground,
    BasePlayer,
    Hud
  },

  setup() {
    // Estado del jugador
    const playerState = ref('standing')
    const capturedFish = ref('')

    // Triggers for Hud component
    //const enableActionButtonTrigger = ref(0);
    //const showCaughtFishTrigger = ref(0);

    // Called when BasePlayer emits animationFinished
    function onAnimationFinished() {
      enableActionButtonTrigger.value++
    }

    function onShowingCaughtFish() {
      showCaughtFishTrigger.value++;
    }

    // Called when Hud emits new player state
    function onSetPlayerState(newState) {
      playerState.value = newState;
    }

    // Called when Hud emits new captured fish id
    function onSetCapturedFish(fishId) {
      capturedFish.value = fishId;
    }

    return {
      playerState,
      capturedFish,
      enableActionButtonTrigger,
      showCaughtFishTrigger,
      onAnimationFinished,
      onShowingCaughtFish,
      onSetPlayerState,
      onSetCapturedFish
    };
  }
};
</script>

<style>
img {
  -webkit-user-drag: none;
}
</style>

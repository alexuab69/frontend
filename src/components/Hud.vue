<template>
  <BaseCaptures>
    <template #default>
      <BaseAttempt
        v-for="(attempt, index) in attempts"
        :key="index"
        :difficulty="attempt.difficulty"
        :successful="attempt.successful"
      />
    </template>
  </BaseCaptures>

  <Minigame
    :visible="isMinigameVisible"
    :difficulty="minigameDifficulty"
    @finished="onMinigameFinished"
  />

  <CaughtFishDialog
    v-if="showCaughtFish"
    :difficulty="minigameDifficulty"
  />

  <BaseYellowIndicator :showTrigger="yellowIndicatorTrigger" />

  <BaseActionButton
    :text="actionButtonText"
    :disabled="isActionButtonDisabled"
    @click="onActionButtonClick"
    @pressed="onActionButtonPressed"
    @released="onActionButtonReleased"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCaptures from '../base_components/BaseCaptures.vue'
import BaseAttempt from '../base_components/BaseAttempt.vue'
import BaseYellowIndicator from '../base_components/BaseYellowIndicator.vue'
import BaseActionButton from '../base_components/BaseActionButton.vue'
import CaughtFishDialog from './CaughtFishDialog.vue'
import Minigame from './Minigame.vue'
import {PULL_ROD_TIMEOUT_MS} from '../../public/globals.js'
// Props (triggers)
const props = defineProps({
  enableActionButtonTrigger: Number,
  showCaughtFishTrigger: Number,
})

// Emits
const emit = defineEmits(['setPlayerState', 'setCapturedFish'])

// Estado interno
const actionButtonText = ref('CAST')
const isActionButtonDisabled = ref(false)
const isMinigameVisible = ref(false)
const showCaughtFish = ref(false)
const yellowIndicatorTrigger = ref(0)
const attempts = ref([])
const minigameDifficulty = ref('')

// Watchers para triggers
watch(() => props.enableActionButtonTrigger, () => {
  isActionButtonDisabled.value = false
})

watch(() => props.showCaughtFishTrigger, () => {
  showCaughtFish.value = true
})

// Manejadores de eventos
function onMinigameFinished(success) {
  isMinigameVisible.value = false
  emit('setPlayerState', 'reeling_in')
  emit('setCapturedFish', success ? DIFFICULTY_TO_FISH_TYPE[minigameDifficulty.value] : '')
  actionButtonText.value = 'CAST'
  isActionButtonDisabled.value = true

  attempts.value.push({
    difficulty: minigameDifficulty.value,
    successful: success
  })

  if (attempts.value.length >= ATTEMPTS_DIFFICULTY.length) {
    actionButtonText.value = 'RETRY'
  }
}

async function onActionButtonClick() {
  if (isActionButtonDisabled.value || isMinigameVisible.value) return

  if (actionButtonText.value === 'CAST') {
    showCaughtFish.value = false

    const response = await fetch('/cast_line')
    if (response.ok) {
      emit('setPlayerState', 'casting')
      actionButtonText.value = 'START'
      isActionButtonDisabled.value = true

      const waitRes = await fetch('/wait_for_bite')
      if (waitRes.ok) {
        yellowIndicatorTrigger.value++

        setTimeout(() => {
          if (!isMinigameVisible.value) {
            emit('setPlayerState', 'reeling_in')
            emit('setCapturedFish', '')
            actionButtonText.value = 'CAST'
            isActionButtonDisabled.value = true
          }
        }, PULL_ROD_TIMEOUT_MS)
      }
    }
  }

  else if (actionButtonText.value === 'START') {
    const response = await fetch('/reel_in')
    const data = await response.json()

    if (data.errorCode === 'standing') {
      emit('setPlayerState', 'reeling_in')
      emit('setCapturedFish', '')
      actionButtonText.value = 'CAST'
      isActionButtonDisabled.value = true
    } else if (data.difficulty) {
      emit('setPlayerState', 'playing')
      isMinigameVisible.value = true
      minigameDifficulty.value = data.difficulty
      actionButtonText.value = 'PULL'
    }
  }

  else if (actionButtonText.value === 'RETRY') {
    showCaughtFish.value = false
    attempts.value = []
    emit('setCapturedFish', '')
    actionButtonText.value = 'CAST'
  }
}

function onActionButtonPressed() {
  if (isMinigameVisible.value) {
    fetch('/move_catch_bar_up')
  }
}

function onActionButtonReleased() {
  if (isMinigameVisible.value) {
    fetch('/stop_moving_catch_bar_up')
  }
}
</script>

<template>
  <div>
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

    <BaseCaughtFishDialog
      v-if="showCaughtFish"
      :fishType="lastCapturedFish"
    >
      <template #fishName>
        {{ fishName }}
      </template>

      <template #fishInchesLabel>
        Length:
      </template>

      <template #fishInches>
        {{ fishLength }}
      </template>
    </BaseCaughtFishDialog>

    <BaseYellowIndicator :showTrigger="yellowIndicatorTrigger" />

    <Minigame
      :visible="minigameVisible"
      :difficulty="lastCapturedDifficulty"
      @finished="onMinigameFinished"
    />

    <BaseActionButton
      :text="actionButtonText"
      :disabled="actionButtonDisabled"
      @click="handleActionButtonClick"
      @pressed="handleButtonPressed"
      @released="handleButtonReleased"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCaptures from '@/base_components/BaseCaptures.vue'
import BaseAttempt from '@/base_components/BaseAttempt.vue'
import BaseYellowIndicator from '@/base_components/BaseYellowIndicator.vue'
import BaseActionButton from '@/base_components/BaseActionButton.vue'
import Minigame from './Minigame.vue'
import {
  DIFFICULTY_TO_FISH_TYPE,
  PULL_ROD_TIMEOUT_MS,
  ATTEMPTS_DIFFICULTY,
  DIFFICULTY_TO_FISH_NAME,
  DIFFICULTY_TO_FISH_MIN_LENGTH,
  DIFFICULTY_TO_FISH_MAX_LENGTH
} from '../../public/globals'
import { enableActionButtonTrigger, showCaughtFishTrigger } from './App.vue'
import BaseCaughtFishDialog from '@/base_components/BaseCaughtFishDialog.vue'

const emit = defineEmits(['setPlayerState', 'setCapturedFish'])

const BASE_URL = 'http://localhost:8081'

const minigameVisible = ref(false)
const actionButtonText = ref('cast')
const actionButtonDisabled = ref(false)
const showCaughtFish = ref(false)
const yellowIndicatorTrigger = ref(0)
const attempts = ref([])
const lastCapturedDifficulty = ref('')
let lastCapturedFish = ref('')
let biteTimeout = null
const fishName = ref('');
const fishLength = ref('');


watch(() => enableActionButtonTrigger.value, () => {
  actionButtonDisabled.value = false
})

watch(() => showCaughtFishTrigger.value, () => {
  showCaughtFish.value = true
})

const handleActionButtonClick = async () => {
  if (minigameVisible.value || actionButtonDisabled.value) return
  switch (actionButtonText.value.toLowerCase()) {
    case 'cast':
      showCaughtFish.value = false
      await castLine()
      break

    case 'start':
      
      await reelIn()
      break

    case 'retry':
      showCaughtFish.value = false
      fishName.value = ''
      fishLength.value = ''
      lastCapturedFish = ''
      attempts.value = []
      emit('setCapturedFish', '')
      actionButtonText.value = 'cast'
      break
  }
}

const castLine = async () => {
  const res = await fetch(`${BASE_URL}/cast_line`)
  if (res.ok) {
    emit('setPlayerState', 'casting')
    actionButtonText.value = 'start'
    await waitForBite()
  }
}

const waitForBite = async () => {
  const res = await fetch(`${BASE_URL}/wait_for_bite`)
  if (res.ok) {
    yellowIndicatorTrigger.value++
    if (biteTimeout) clearTimeout(biteTimeout)
    biteTimeout = setTimeout(() => {
      if (!minigameVisible.value) {
        emit('setPlayerState', 'reeling_in')
        emit('setCapturedFish', '')
        actionButtonText.value = 'cast'
        actionButtonDisabled.value = true
      }
    }, PULL_ROD_TIMEOUT_MS)
  }
}

const reelIn = async () => {
  const res = await fetch(`${BASE_URL}/reel_in`)
  const data = await res.json()

  if (!res.ok && data.errorCode === 'line_cast') {
    emit('setPlayerState', 'reeling_in')
    emit('setCapturedFish', '')
    actionButtonText.value = 'cast'
    actionButtonDisabled.value = true
    return
  }

  if (data.difficulty) {
    minigameVisible.value = true
    lastCapturedDifficulty.value = data.difficulty
    emit('setPlayerState', 'playing')
    actionButtonText.value = 'pull'
    actionButtonDisabled.value = false
  }
}

const handleButtonPressed = async () => {
  if (minigameVisible.value) {
    await fetch(`${BASE_URL}/move_catch_bar_up`)
  }
}

const handleButtonReleased = async () => {
  if (minigameVisible.value) {
    await fetch(`${BASE_URL}/stop_moving_catch_bar_up`)
  }
}

const onMinigameFinished = (successful) => {
  minigameVisible.value = false
  emit('setPlayerState', 'reeling_in')

  const difficulty = lastCapturedDifficulty.value

  const fishId = successful
    ? DIFFICULTY_TO_FISH_TYPE[difficulty]
    : ''
  emit('setCapturedFish', fishId)

  if(successful) {
    fishName.value = DIFFICULTY_TO_FISH_NAME[difficulty]
    const minLength = DIFFICULTY_TO_FISH_MIN_LENGTH[difficulty];
    const maxLength = DIFFICULTY_TO_FISH_MAX_LENGTH[difficulty];
    const randomLength = (Math.random() * (maxLength - minLength) + minLength).toFixed(1);
    fishLength.value = `${randomLength} in`;
    showCaughtFish.value = true
    lastCapturedFish = DIFFICULTY_TO_FISH_TYPE[lastCapturedDifficulty.value]
  }

  actionButtonText.value = 'cast'
  actionButtonDisabled.value = true

  attempts.value.push({
    difficulty: lastCapturedDifficulty.value,
    successful,
  })

  if (attempts.value.length >= ATTEMPTS_DIFFICULTY.length) {
    actionButtonText.value = 'retry'
    actionButtonDisabled.value = false
  }
}
</script>

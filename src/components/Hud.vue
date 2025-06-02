<script setup>
import { ref, watch } from 'vue'
import Minigame from './Minigame.vue'
import BaseCaptures from '../base_components/BaseCaptures.vue'
import BaseAttempt from '../base_components/BaseAttempt.vue'
import BaseYellowIndicator from '../base_components/BaseYellowIndicator.vue'
import BaseActionButton from '../base_components/BaseActionButton.vue'
import CaughtFishDialog from './CaughtFishDialog.vue'

import { DIFFICULTY_TO_FISH_TYPE, PULL_ROD_TIMEOUT_MS } from '../globals.js'

// Props
defineProps({
  showCaughtFishTrigger: Number,
  enableActionButtonTrigger: Number
})

// Emits
const emit = defineEmits(['setPlayerState', 'setCapturedFish'])

// Estado interno
const attempts = ref([])
const minigameVisible = ref(false)
const minigameDifficulty = ref('')
const actionButtonText = ref('CAST')
const actionButtonDisabled = ref(false)
const yellowIndicatorTrigger = ref(0)
const showCaughtFishDialog = ref(false)

// Watchers de triggers
watch(() => showCaughtFishTrigger, () => {
  showCaughtFishDialog.value = true
})

watch(() => enableActionButtonTrigger, () => {
  actionButtonDisabled.value = false
})

</script>

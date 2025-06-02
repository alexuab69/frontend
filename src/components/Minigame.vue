<template>
  <BaseMinigame :visible="visible" :spoolRotationType="spoolRotationType">
    <BaseCatchBar
      :direction="catchBar.direction"
      :lastSwapAt="catchBar.lastSwapAt"
      :lastSwapPosition="catchBar.lastSwapPosition"
    />
    <BaseFish
      :direction="fish.direction"
      :lastSwapAt="fish.lastSwapAt"
      :lastSwapPosition="fish.lastSwapPosition"
      :speed="fish.speed"
      :isLegend="fish.isLegend"
    />
    <BaseProgressBar
      :direction="progress.direction"
      :lastSwapAt="progress.lastSwapAt"
      :lastSwapPosition="progress.lastSwapPosition"
    />
  </BaseMinigame>
</template>

<script>
import BaseMinigame from '@/base_components/BaseMinigame.vue'
import BaseCatchBar from '@/base_components/BaseCatchBar.vue'
import BaseFish from '@/base_components/BaseFish.vue'
import BaseProgressBar from '@/base_components/BaseProgressBar.vue'
import {
  FISH_MAX_POS,
  GET_MINI_GAME_INFO_RETRIEVE_FREQUENCY, 
  DIFFICULTY_TO_FISH_TYPE, 
  DIFFICULTY_TO_FISH_SPEED,
} from '../../public/globals'

export default {
  name: 'Minigame',
  components: {
    BaseMinigame,
    BaseCatchBar,
    BaseFish,
    BaseProgressBar
  },
  props: {
    visible: Boolean,
    difficulty: String
  },
  data() {
    return {
      spoolRotationType: 'clockwise',
      catchBar: { direction: '', lastSwapAt: 0, lastSwapPosition: 0 },
      fish: {
        direction: 'up',
        lastSwapAt: Date.now(),
        lastSwapPosition: FISH_MAX_POS / 2,
        speed: DIFFICULTY_TO_FISH_SPEED[this.difficulty] || 1,
        isLegend: DIFFICULTY_TO_FISH_TYPE[this.difficulty] == 'legend'
      },
      progress: { direction: '', lastSwapAt: 0, lastSwapPosition: 0 },
      timer: null,
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fish.speed = DIFFICULTY_TO_FISH_SPEED[this.difficulty]
        this.fish.isLegend = DIFFICULTY_TO_FISH_TYPE[this.difficulty] == 'legend'
        this.startPolling()
      } else {
        this.stopPolling()
      }
    }
  },
  methods: {
    async get_mini_game_info() {
      try {
        const res = await fetch('http://localhost:8081/get_mini_game_info')
        if (res.ok) {
          const data = await res.json()
          console.log('Minigame info:', data)
          this.processCatchBarInfo(data.catchBarInfo)
          this.processFishInfo(data.fishInfo)
          this.processProgressBarInfo(data.progressBarInfo)
        }
      } catch (error) {
        console.error('Error getting minigame info:', error)
      }
    },
    startPolling() {
      if (this.timer) return; // evita múltiples timers
      this.timer = setInterval(() => {
        this.get_mini_game_info()
      }, GET_MINI_GAME_INFO_RETRIEVE_FREQUENCY)
    },
    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    processCatchBarInfo(info) {
      this.catchBar.direction = info.direction
      this.catchBar.lastSwapAt = info.lastSwapAt
      this.catchBar.lastSwapPosition = info.lastSwapPosition
    },
    processFishInfo(info) {
      this.fish.direction = info.direction
      this.fish.lastSwapAt = info.lastSwapAt
      this.fish.lastSwapPosition = info.lastSwapPosition
    },
    processProgressBarInfo(info) {
      if (info.state !== 'in_progress') {
        this.$emit('finished', info.state === 'successful')
        this.stopPolling()
      } else {
        this.progress.direction = info.direction
        this.progress.lastSwapAt = info.lastSwapAt
        this.progress.lastSwapPosition = info.lastSwapPosition
        this.spoolRotationType = info.direction === 'up' ? 'clockwise' : 'anticlockwise'
      }
    }
  },
  mounted() {
    if (this.visible) {
      this.startPolling()
    }
  },
  beforeDestroy() {
    this.stopPolling()
  }
}
</script>

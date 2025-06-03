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
  DIFFICULTY_TO_FISH_SPEED,
  DIFFICULTY_TO_FISH_TYPE
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
      interval: null,
      catchBar: { direction: '', lastSwapAt: 0, lastSwapPosition: 0 },
      fish: {
        direction: '',
        lastSwapAt: 0,
        lastSwapPosition: 0,
        speed: 0,
        isLegend: false
      },
      progress: { direction: '', lastSwapAt: 0, lastSwapPosition: 0 }
    }
  },
  computed: {
    spoolRotationType() {
      return this.progress.direction === 'up' ? 'clockwise' : 'anticlockwise'
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    }
  },
  mounted() {
    if (this.visible) {
      this.startPolling()
    }
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    startPolling() {
      this.fish.speed = DIFFICULTY_TO_FISH_SPEED[this.difficulty] || 1
      this.fish.isLegend = DIFFICULTY_TO_FISH_TYPE[this.difficulty] === 'legend'

      this.interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8081/get_mini_game_info')
          if (res.ok) {
            const data = await res.json()
            if (data.catchBar) this.processCatchBarInfo(data.catchBar)
            if (data.fish) this.processFishInfo(data.fish)
            if (data.progressBar) this.processProgressBarInfo(data.progressBar)
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 500)
    },
    stopPolling() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    processCatchBarInfo(info) {
      this.catchBar = {
        direction: info.direction,
        lastSwapAt: info.lastSwapAt,
        lastSwapPosition: info.lastSwapPosition
      }
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
        this.progress = {
          direction: info.direction,
          lastSwapAt: info.lastSwapAt,
          lastSwapPosition: info.lastSwapPosition
        }
      }
    }
  }
}
</script>

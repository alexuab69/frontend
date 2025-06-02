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
const DIFFICULTY_TO_FISH_SPEED = {
  easy: 1,
  medium: 2,
  hard: 3,
  legend: 4
}
import BaseMinigame from '@/base_components/BaseMinigame.vue'
import BaseCatchBar from '@/base_components/BaseCatchBar.vue'
import BaseFish from '@/base_components/BaseFish.vue'
import BaseProgressBar from '@/base_components/BaseProgressBar.vue'

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
      fish: { direction: '', lastSwapAt: 0, lastSwapPosition: 0, speed: 0, isLegend: false },
      progress: { direction: '', lastSwapAt: 0, lastSwapPosition: 0 },
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
        clearInterval(this.interval)
        this.interval = null
      }
    }
  },
  methods: {
    async startPolling() {
      if (this.interval) return  // avoid multiple intervals
      this.interval = setInterval(async () => {
        try {
          let domain = window.location.origin;
          let port = 8081;
          let url = `${domain}:${port}/get_mini_game_info`;

          const res = await fetch(url)
          if (!res.ok) throw new Error('Network response not ok')
          const data = await res.json()
          if (data.catchBar) this.processCatchBarInfo(data.catchBar)
          if (data.fish) this.processFishInfo(data.fish)
          if (data.progressBar) this.processProgressBarInfo(data.progressBar)
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 500)
    },
    processCatchBarInfo(info) {
      this.catchBar = {
        direction: info.direction,
        lastSwapAt: info.lastSwapAt,
        lastSwapPosition: info.lastSwapPosition
      }
    },
    processFishInfo(info) {
      this.fish = {
        direction: info.direction,
        lastSwapAt: info.lastSwapAt,
        lastSwapPosition: info.lastSwapPosition,
        speed: DIFFICULTY_TO_FISH_SPEED[this.difficulty] || 1,
        isLegend: this.difficulty === 'legend'
      }
    },
    processProgressBarInfo(info) {
      if (info.state !== 'in_progress') {
        this.$emit('finished', info.state === 'success')
        clearInterval(this.interval)
        this.interval = null
      } else {
        this.progress = {
          direction: info.direction,
          lastSwapAt: info.lastSwapAt,
          lastSwapPosition: info.lastSwapPosition
        }
      }
    }
  },
  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

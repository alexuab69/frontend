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
export default {
  name: 'Minigame',
  props: {
    visible: Boolean,
    difficulty: String
  },
  data() {
    return {
      ws: null,
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
    visible(newVal, oldVal) {
      if (newVal && !this.ws) {
        this.startPolling()
      }
    }
  },
  mounted() {
    this.ws = new WebSocket('ws://localhost:8080')
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.catchBar) this.processCatchBarInfo(data.catchBar)
      if (data.fish) this.processFishInfo(data.fish)
      if (data.progressBar) this.processProgressBarInfo(data.progressBar)
    }
  },
  methods: {
    startPolling() {
      this.interval = setInterval(async () => {
        const res = await fetch('/get_mini_game_info')
        const data = await res.json()
        if (data.catchBar) this.processCatchBarInfo(data.catchBar)
        if (data.fish) this.processFishInfo(data.fish)
        if (data.progressBar) this.processProgressBarInfo(data.progressBar)
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
        speed: DIFFICULTY_TO_FISH_SPEED[this.difficulty],
        isLegend: this.difficulty === 'legend'
      }
    },
    processProgressBarInfo(info) {
      if (info.state !== 'in_progress') {
        this.$emit('finished', info.state === 'success')
        clearInterval(this.interval)
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

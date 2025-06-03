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
  DIFFICULTY_TO_FISH_TYPE, 
  DIFFICULTY_TO_FISH_SPEED,
} from '../../public/globals'
import { onBeforeUnmount } from 'vue'

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
      ws: null,  // guardamos la instancia WebSocket
      wsConnected: false,
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fish.speed = DIFFICULTY_TO_FISH_SPEED[this.difficulty]
        this.fish.isLegend = DIFFICULTY_TO_FISH_TYPE[this.difficulty] == 'legend'
        this.openWebSocket()
      } else {
        this.closeWebSocket()
      }
    }
  },
  methods: {
    openWebSocket() {
      if (this.ws) return // ya abierto

      this.ws = new WebSocket('ws://localhost:8080')

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.wsConnected = true
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.catchBarInfo) this.processCatchBarInfo(data.catchBarInfo)
          else if(data.type === 'catchBarInfo') this.processCatchBarInfo(data.data)
          if (data.fishInfo) this.processFishInfo(data.fishInfo)
          else if(data.type === 'fishInfo') this.processFishInfo(data.data)
          if (data.progressBarInfo) this.processProgressBarInfo(data.progressBarInfo)
          else if(data.type === 'progressBarInfo') this.processProgressBarInfo(data.data)
        } catch (e) {
          console.error('Error parsing WebSocket message:', e)
        }
      }

      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.wsConnected = false
        this.ws = null
      }
    },
    closeWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
        this.wsConnected = false
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
        this.closeWebSocket()
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
      this.openWebSocket()
    }
  },
  beforeUnmount() {
    this.closeWebSocket()
  }
}
</script>


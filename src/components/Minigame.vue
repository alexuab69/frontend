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
import {FISH_MAX_POS, GET_MINI_GAME_INFO_RETRIEVE_FREQUENCY} from '../../public/globals'
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
      fishSimulatedPosition: FISH_MAX_POS,
      fishSimulatedDirection: 'up',
      fishAnimationInterval: null,
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
      this.startFishAnimation() // ← add this
    } else {
      clearInterval(this.interval)
      this.interval = null
      clearInterval(this.fishAnimationInterval) // ← stop animation
      this.fishAnimationInterval = null
    }
    }
  },
  methods: {
    startFishAnimation() {
    if (this.fishAnimationInterval) return;

    const SPEED = this.fish.speed || DIFFICULTY_TO_FISH_SPEED[this.difficulty]; // fallback to medium
    const MIN_POS = 0;
    const MAX_POS = FISH_MAX_POS;

    this.fishSimulatedPosition = this.fish.lastSwapPosition || MAX_POS / 2;
    this.fishSimulatedDirection = this.fish.direction || 'up';

    this.fishAnimationInterval = setInterval(() => {
      const now = Date.now();
      const delta = this.fishSimulatedDirection === 'up' ? 1 : -1;
      const movement = delta * SPEED * 1; // 75ms tick (sync with server polling)

      let newPos = this.fishSimulatedPosition + movement;

      // Clamp position and reverse direction
      if (newPos > MAX_POS) {
        newPos = MAX_POS;
        this.fishSimulatedDirection = 'down';
      } else if (newPos < MIN_POS) {
        newPos = MIN_POS;
        this.fishSimulatedDirection = 'up';
      }

      this.fishSimulatedPosition = newPos;

      // Update fish object passed to BaseFish
      this.fish = {
        ...this.fish,
        lastSwapPosition: newPos,
        lastSwapAt: now,
        direction: this.fishSimulatedDirection,
      };
    }, GET_MINI_GAME_INFO_RETRIEVE_FREQUENCY); // 75ms
  },


    async startPolling() {
      
        try {
          let url = `http://localhost:8081/get_mini_game_info`;

          const res = await fetch(url)
          if (!res.ok) throw new Error('Network response not ok')
          const data = await res.json()
          if (data.catchBar) this.processCatchBarInfo(data.catchBar)
          if (data.fish) this.processFishInfo(data.fish)
          if (data.progressBar) this.processProgressBarInfo(data.progressBar)
        } catch (err) {
          console.error('Polling error:', err)
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

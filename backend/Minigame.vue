<script>
// here goes the root component js
import BaseMinigame from '@/base_components/BaseMinigame.vue';
import BaseCatchBar from '@/base_components/BaseCatchBar.vue';  
import BaseFish from '@/base_components/BaseFish.vue';  
import BaseProgressBar from '@/base_components/BaseProgressBar.vue';   
import * as global from '@/../public/globals.js'; 

export default {
    components: {
        BaseMinigame,
        BaseCatchBar,
        BaseFish,
        BaseProgressBar,
    },
    props: ['visible', 'difficulty'],
    emits: ['finished'],
    data() {
        return {
            spoolRotationType: 'clockwise',
            catchBarDirection: '', 
            catchBarLastSwapPosition: 0,
            catchBarLastSwapAt: 0,
            fishDirection: '',
            fishLastSwapPosition: 0,
            fishLastSwapAt: 0,
            fishSpeed: global.DIFFICULTY_TO_FISH_SPEED[this.difficulty],
            fishLegend: global.DIFFICULTY_TO_FISH_TYPE[this.difficulty] == 'legend',
            progressBarDirection: '',
            progressBarLastSwapPosition: 0,
            progressBarLastSwapAt: 0,
            state: '',
            baseURL: 'http://localhost:8081',
            ws: null,
            wsConnected: false,
            timer: null,
        }
    },
    watch: {
        visible() {
            if (this.visible && !this.wsConnected) {
                this.fishSpeed = global.DIFFICULTY_TO_FISH_SPEED[this.difficulty];
                this.fishLegend = global.DIFFICULTY_TO_FISH_TYPE[this.difficulty] == 'legend';
                this.startPolling();
            } else if (!this.visible) {
                this.stopPolling();
            }
        }
    },
    methods: {
        startPolling() {
            this.timer = setInterval(async () => {
                await this.MinigameInfo();
            }, global.GET_MINI_GAME_INFO_RETRIEVE_FREQUENCY); 
        },
        stopPolling() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        async MinigameInfo() {
            try {
                const response = await fetch(this.baseURL + '/get_mini_game_info');
                if (response.ok) {
                    const data = await response.json();
                    this.processCatchBarInfo(data);
                    this.processFishInfo(data);
                    this.processProgressBarInfo(data);
                }
            } catch (error) {
                console.error('Error getting minigame info:', error);
            }
        },
        processCatchBarInfo(data){
            if (data.catchBarInfo) {
                this.catchBarDirection = data.catchBarInfo.direction;
                this.catchBarLastSwapPosition = data.catchBarInfo.lastSwapPosition;
                this.catchBarLastSwapAt = data.catchBarInfo.lastSwapAt;
            }else if (data.type === 'catchBarInfo') {
                this.catchBarDirection = data.data.direction;
                this.catchBarLastSwapPosition = data.data.lastSwapPosition;
                this.catchBarLastSwapAt = data.data.lastSwapAt;
            }
        },
        processFishInfo(data) {
            if (data.type === 'fishInfo') {
                this.fishDirection = data.data.direction;
                this.fishLastSwapPosition = data.data.lastSwapPosition;
                this.fishLastSwapAt = data.data.lastSwapAt;
                this.fishSpeed = data.data.speed;
            } else if (data.fishInfo) {
                this.fishDirection = data.fishInfo.direction;
                this.fishLastSwapPosition = data.fishInfo.lastSwapPosition;
                this.fishLastSwapAt = data.fishInfo.lastSwapAt;
            }
            
        },
        processProgressBarInfo(data) {
            if (data.type === 'progressBarInfo') {
                this.state = data.data.state;
                if (this.state === 'in_progress') {
                    this.progressBarDirection = data.data.direction;
                    this.progressBarLastSwapPosition = data.data.lastSwapPosition;
                    this.progressBarLastSwapAt = data.data.lastSwapAt;

                    this.spoolRotationType = data.data.direction === 'up' ? 'clockwise' : 'anticlockwise';
                }else {
                    this.$emit('finished', this.state === 'successful');
                    this.stopPolling();
                }
            } else if (data.progressBarInfo) {
                this.state = data.progressBarInfo.state;
                if (this.state === 'in_progress') {
                    this.progressBarDirection = data.progressBarInfo.direction;
                    this.progressBarLastSwapPosition = data.progressBarInfo.lastSwapPosition;
                    this.progressBarLastSwapAt = data.progressBarInfo.lastSwapAt;

                    this.spoolRotationType = data.progressBarInfo.direction === 'up' ? 'clockwise' : 'anticlockwise';
                } else {
                    this.$emit('finished', this.state === 'successful');
                    this.stopPolling();
                }
            }
        },
        startWebSocket() {
            try {
                this.ws = new WebSocket('ws://localhost:8080');
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.wsConnected = true;
                    this.stopPolling();
                };

                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.processCatchBarInfo(data);
                    this.processFishInfo(data);
                    this.processProgressBarInfo(data);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.wsConnected = false;
                    if (this.visible) {
                        this.startPolling();
                    }
                };
            } catch (error) {
                console.error('WebSocket setup error:', error);
                if (this.visible) {
                    this.startPolling();
                }
            }
        }
    },
    mounted() {
        this.startWebSocket();
    },
    beforeDestroy() {
        this.stopPolling();
        if (this.ws) {
            this.ws.close();
        }
    }
}
</script>

<template>
    <BaseMinigame :visible="visible" :spool-rotation-type="spoolRotationType">  
        <BaseCatchBar :direction="catchBarDirection" :last-swap-position="catchBarLastSwapPosition" :last-swap-at="catchBarLastSwapAt"/>
        <BaseFish :direction="fishDirection" :last-swap-position="fishLastSwapPosition" :last-swap-at="fishLastSwapAt" :speed="fishSpeed" :is-legend="fishLegend"/>
        <BaseProgressBar :direction="progressBarDirection" :last-swap-position="progressBarLastSwapPosition" :last-swap-at="progressBarLastSwapAt"/>
    </BaseMinigame>
</template>

<style scoped>

</style>

<template>
    <div id="container">
        <div>
            <vue-plyr :emit="['timeupdate']" displayDuration @timeupdate="videoTimeUpdated" ref="plyr" v-bind:key="nowPlaying.videoId">
                <div>
                    <iframe :src="'https://www.youtube.com/embed/'+nowPlaying.videoId+'?iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1'" allowfullscreen allowtransparency allow="autoplay">
                    </iframe>
                </div>
            </vue-plyr>
        </div>
        <footer class="footer" v-bind:key="nowPlaying.videoId">
            <img class="thumb" :src="'https://img.youtube.com/vi/'+nowPlaying.videoId+'/mqdefault.jpg'" />
            <div class="bar">
                <div id="progressBar">
                    <div></div>
                    <p style="font-size: 10px;margin: 5px 0 5px 2px;">
                    </p>
                </div>
            </div>
            <div class="controls">
                <button class="icon-fast-backward" @click="rewind(10)"><img src="@/assets/rewind.svg" alt=""></button>
                <button class="icon-play" id="play" @click="playVideo()"><img src="@/assets/play.svg" alt=""></button>
                <button class="icon-pause" id="pause" @click="pauseVideo()"><img src="@/assets/pause.svg" alt=""></button>
                <button class="icon-fast-forward" @click="forward(10)"><img src="@/assets/fast-forward.svg" alt=""></button>
            </div>
        </footer>
    </div>
</template>
<script>
/* eslint-disable */
export default {
    name: 'currentSong',
    props: ['nowPlaying'],
    data(){
        return {
            //progress: null,
            duration: null,
            plrInitialized: false,
        }
    },
    mounted() {
    	this.$nextTick().then(res => {
    		if(this.plrInitialized) return;
            this.initializePlyr()
    	});
    },
    methods: {
        playVideo() {
            this.$refs.plyr.player.play()
        },
        pauseVideo() {
            this.$refs.plyr.player.pause()
        },
        forward(seekTime) {
            this.$refs.plyr.player.forward(seekTime)
        },
        rewind(seekTime) {
            this.$refs.plyr.player.rewind(seekTime)
        },
        videoTimeUpdated() {
            function fmtMSS(s) { return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s }
            this.progress = fmtMSS(Math.floor(this.$refs.plyr.player.currentTime));
            this.duration = fmtMSS(Math.floor(this.$refs.plyr.player.duration));
        },
        initializePlyr() {
            let player = this.$refs.plyr.player;

            player.on('ready', event => {
                const instance = event.detail.plyr;
                console.log(`instance is: ` + instance);
                this.plrInitialized = true;
            });

            player.on('ended', event => {
                console.log('Ended!')
                this.$emit('ended');
            });
        }
    }
}
</script>
<style scoped>
#container {
    width: 340px;
    margin: 0 auto;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
    line-height: 0;
}

.display {
    position: relative;
    height: 0;
    width: 100%;
    padding-bottom: 50%;
    padding-top: 25px;
    overflow: hidden;
}

.display iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    height: 100%;
}

.display.hidden {
    padding: 0;
}

.footer {
    position: relative;
    background: #FFF;
}

.footer .thumb {
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 15px;
    width: 115px;
    height: 70px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    box-shadow: 0 0 2px 2px #d2d2d2;
}

.footer .bar {
    background-color: #ddd;
    padding: 0 5px 0 140px;
}

.footer #progressBar {
    height: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

}

.footer #progressBar div {
    margin-top: 0px;
    height: 2px;
    width: 0;
    background-color: #2c3e50;
}

.footer .controls {
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: end;
    justify-content: flex-end;
}

.footer .controls button {
    display: block;
    width: 50px;
    height: 50px;
    font-size: 15px;
    color: #bbb;
    background: transparent;
    border: none;
    cursor: pointer;
}

.footer .controls button:first-child {
    border-right: 1px solid #EEE;
}

.footer .controls button:last-child {
    border-left: 1px solid #EEE;
}
</style>
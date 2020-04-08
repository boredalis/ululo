<template>
    <div class="player" v-if="currentSong">
        <h1 class="song-title">{{ currentSong.title }}</h1>
        <div class="cover-art">
            <img :src="background.url" alt="" />
        </div>
        <vue-plyr v-show="false" ref="plyr" :key="currentSong.videoId">
            <div>
                <iframe :src="
                        'https://www.youtube.com/embed/' +
                            currentSong.videoId +
                            '?iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1'
                    " allowfullscreen allowtransparency allow="autoplay">
                </iframe>
            </div>
        </vue-plyr>
        <div class="progress"></div>
        <div class="play-buttons">
            <HeartIcon />
            <PauseIcon ref="pause" class="play" @click="pauseVideo()" v-if="!isPaused" />
            <PlayIcon ref="play" class="play" @click="playVideo()" v-else />
            <VolumeXIcon class="volume" @click="enableVolume()" v-if="muteAudio" />
            <Volume1Icon class="volume" @click="disableVolume()" v-else />
        </div>
    </div>
</template>
<script>
import {
    PlayIcon,
    PauseIcon,
    Volume1Icon,
    VolumeXIcon,
    HeartIcon,
} from "vue-feather-icons";
let emitTimeInterval;
let checkTimeInterval;

export default {
    props: {
        currentSong: {
            type: Object,
            default: function() {
                return { title: "Waiting..." };
            }
        },
        isGuest: Boolean,
    },
    components: {
        PlayIcon,
        PauseIcon,
        Volume1Icon,
        VolumeXIcon,
        HeartIcon,
    },
    created() {
        this.plrInitialized = false;
    },
    mounted() {
        clearInterval(emitTimeInterval);
        clearInterval(checkTimeInterval);
        const pollingInterval = 10000;

        const checkLocalTime = s => {
            const remoteTime = this.remoteCurrentTime
            const localTime = this.plyrRef.currentTime
            const difference = remoteTime - localTime
            console.log({ difference })
            this.playVideo()
            if (difference < 0 || difference >=8) this.syncLocalTime()
        }
        const emitLocalTime = () => {
            this.localCurrentTime = Math.round(this.plyrRef.currentTime)
            this.$emit("currentTime", this.localCurrentTime);
        }

        this.$nextTick().then(res => {
            if (this.plrInitialized) return
            return this.initializePlyr()
        }).then(res => {
            if (this.isGuest) return Promise.resolve()
            const hostNeedsSync = !!this.remoteCurrentTime && !this.plyrRef.currentTime;
            console.log('Needs sync', hostNeedsSync)
            if (hostNeedsSync) checkLocalTime()
            emitTimeInterval = setInterval(emitLocalTime, pollingInterval);
        }).then(() => {
            if (!this.isGuest) return
            checkLocalTime()
            checkTimeInterval = setInterval(checkLocalTime, pollingInterval)
        })
    },
    data: () => ({
        muteAudio: false,
        isPaused: false,
        plrInitialized: false,
        localDuration: null,
        localCurrentTime: null,
    }),
    watch: {
        videoId() {
            //this.plyrRef = this.$refs.plyr.player;
        }
    },
    computed: {
        videoId() {
            return this.currentSong.videoId
        },
        remoteCurrentTime() {
            return this.currentSong.currentTime
        },
        background() {
            if (!this.currentSong) return;
            const { maxres, high } = this.currentSong.thumbnails;
            if (maxres) return maxres;
            return high;
        },
        plyrRef() {
            return this.$refs.plyr && this.$refs.plyr.player;
        }
    },
    methods: {
        playVideo() {
            console.log('Play video')
            this.isPaused = false;
            this.plyrRef.play();
        },
        pauseVideo() {
            this.isPaused = true;
            this.plyrRef.pause();
        },
        enableVolume() {
            this.muteAudio = false;
            this.plyrRef.volume = 1;
        },
        disableVolume() {
            this.muteAudio = true;
            this.plyrRef.volume = 0;
        },
        syncLocalTime() {
            this.plyrRef.currentTime = this.remoteCurrentTime
        },
        initializePlyr() {
            return new Promise((resolve, reject) => {
                let player = this.$refs.plyr.player;
                let song = this.currentSong
                player.on("ready", event => {
                    this.plrInitialized = true;
                    this.isPaused = false;
                    this.localDuration = this.plyrRef.duration;
                    resolve()
                });

                player.on("ended", event => {
                    this.$emit("ended", song);
                });
            })
        }
    }
};
</script>
<style lang="scss">
.player {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 20px;
    background-color: black;

    h1.song-title {
        margin-top: 20px;
        color: white;
        text-stroke: 1px black;
    }

    .cover-art {
        margin: auto 0;
        padding-bottom: 85px;
        width: 400px;
        overflow: hidden;
        display: flex;
        align-items: center;

        img {
            object-fit: contain;
            width: 100%;
        }
    }
}

.play-buttons {
    position: absolute;
    bottom: 20px;
    display: flex;
    align-items: center;
    padding: 10px;

    background-color: rgba(black, 0.8);
    border-radius: 10px;
    backdrop-filter: blur(10px);

    svg {
        width: 25px;
        height: 25px;
        fill: white;
        stroke: white;
        margin: 0px 10px;

        &.play {
            width: 45px;
            height: 45px;
        }
    }
}
</style>
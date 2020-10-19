<template>
    <div class="player" v-if="currentSong">
        <h1 class="song-title">{{ currentSong.title }}</h1>
        <div class="cover-art">
            <img :src="background.url" alt="" />
        </div>
        <vue-plyr v-show="false" ref="plyr" :key="currentSong.videoId">
            <div ref="myFrame">
                <iframe :src="'https://www.youtube.com/embed/'+ currentSong.videoId + '?&modestbranding=1&playsinline=1&enablejsapi=1&autopause=0&autoplay=1'" allowfullscreen allowtransparency allow="autoplay" >
                </iframe>
            </div>
        </vue-plyr>
        <div class="progress"></div>
        <div class="play-buttons">
            <HeartIcon class="heart-icon" @click="likeSong()" />
            <HeartIcon class="heart-icon is-clicked-1" />
            <HeartIcon class="heart-icon is-clicked-2" />
            <PauseIcon ref="pause" class="play" @click="pauseVideo()" v-if="!songIsPaused" />
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
        this.songIsPaused = this.isPaused
        clearInterval(emitTimeInterval);
        clearInterval(checkTimeInterval);
        const pollingInterval = 10000;

        const checkLocalTime = s => {
            const remoteTime = this.remoteCurrentTime
            const localTime = this.plyrRef.currentTime
            const difference = remoteTime - localTime
            if (this.isPaused) {
                this.songIsPaused = false;
                //this.pauseVideo()
            } else {
                this.playVideo()
                if (difference < 0 || difference >= 8) {
                    this.syncLocalTime()
                }
            }

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
        songIsPaused: false,
        plrInitialized: false,
        localDuration: null,
        localCurrentTime: null,
    }),
    computed: {
        videoId() {
            return this.currentSong.videoId
        },
        isPaused() {
            return this.currentSong.isPaused
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
            this.songIsPaused = false
            this.$emit("paused", this.songIsPaused)
            this.plyrRef.play();
        },
        pauseVideo() {
            this.songIsPaused = true;
            this.$emit("paused", this.songIsPaused)
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
        likeSong() {
            this.$emit('likedSong', this.currentSong)
        },
        initializePlyr() {
            return new Promise((resolve, reject) => {
                let player = this.$refs.plyr.player;
                let song = this.currentSong
                player.on("ready", event => {
                    this.plrInitialized = true;
                    this.$emit("paused", this.songIsPaused)
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
        cursor: pointer;
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

    .heart-icon {
        transition: .2s ease-in-out;

        &.is-clicked-1 {
            opacity: 0;
            position: absolute;
            left: -8px;
            height: 18px;
            top: 14px;
            fill: darkred;
            stroke: darkred;

        }

        &.is-clicked-2 {
            opacity: 0;
            position: absolute;
            left: -12px;
            height: 14px;
            top: 10px;
            fill: darkred;
            stroke: darkred;
        }

        &:hover {
            fill: red;
            stroke: red;
        }

        &:active {
            transform: scale(0.9);
            fill: darkred;
            stroke: darkred;

            ~.heart-icon.is-clicked-1 {
                animation: make-transition-1 .8s ease-in-out;
            }

            ~.heart-icon.is-clicked-2 {
                animation: make-transition-2 .8s ease-in-out;
            }
        }

        @keyframes make-transition-1 {
            0% {
                opacity: 0;
            }

            50% {
                opacity: 1;
                transform: scale(0.8) translate(-.6em, -.5em);
            }

            100% {
                opacity: 0;
                transform: scale(0) translate(-.6em, -.5em);
            }
        }

        @keyframes make-transition-2 {
            0% {
                opacity: 0;
            }

            50% {
                opacity: 1;
                transform: scale(0.8) translate(-1.7em, -1em);
            }

            100% {
                opacity: 0;
                transform: scale(0) translate(-1.7em, -1em);
            }
        }
    }
}
</style>
<template>
    <div class="partywithus">
        <div class="admin-buttons" style="position: fixed; top: 10px; right: 10px;z-index: 20;">
            <button v-if="currentSong" @click="playNext(currentSong)">Next</button>
        </div>
        <div class="ana-e-majt">
            <div class="upnext">
                <div>
                    <p>COLLABORATORS</p>
                    <div class="collabs">
                        <Collaborators v-for="collaborator in collaborators" :collaborator="collaborator">
                        </Collaborators>
                    </div>
                </div>
                <div>
                    <h1>Up next</h1>
                    <p class="popup" v-if="shouldYield">One collaborator per time!</p>
                    <span v-if="!upcomingSongsData">Looks empty in here... </span>
                    <span class="songs-list" v-if="!upcomingSongs.length && finishedSongs" @click="historyToPlayNext()">Add already played songs?</span>
                    <span class="songs-list" v-if="!upcomingSongs.length && likedSongs" @click="likedSongsToPlayNext()">
                        Or your liked songs?
                    </span>
                    <ul :style="`max-height:${maxListHeightStyle}; overflow-y: auto;`" ref="songsListRef" name="flip-list" tag="ul">
                        <SongListItem id="songsListId" @shouldVote="shouldRemoveSong" v-for="song in upcomingSongsData" :songProperties="song" v-bind:key="song.id" />
                    </ul>
                </div>
            </div>
            <div class=" add-new-song" ref="newSongRef">
                <p>
                    Its your time to shine, add the next song  to our playlist:
                </p>
                <div class="paste-link-input">
                    <input type="text" v-model="youtubeLink" placeholder="https://youtube.com/urh34/" />
                    <button :disabled="!appIsReady" @click="addSong()">Add</button>
                </div>
            </div>
        </div>
        <div class="ana-e-djatht">
            <Player :currentSong="currentSong" :isGuest="!isUserPlaylistOwner" @currentTime="updateTime" @ended="playNext" @likedSong="updateLikedSongs" @paused="songPaused" v-if="currentSong" :key="currentSong && currentSong.videoId" />
        </div>
        <div class="song-postart" :style="imageBackgroundStyle" :class="{ 'default-cover': !currentSong }">
            <img :src="getDefaultPoster(defaultPoster.filePath)" v-if="!currentSong" alt="default-poster" />
        </div>
        <div class="showSongPopup" v-if="showPopUp">
            <div>
                <p>Do you want to <b>remove</b> the song from the playlist?</p>
                <div>
                    <button @click="removeSong" class="buttons">YES</button>
                    <button @click="showPopUp=false" class="buttons">NO</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { db, getCurrentUser } from '../firebaseConfig.js';
//import router from '../router/index';
const ytApiKey = "AIzaSyC4Cun-uRQha90s5ZrggZNgnvokkaIai-g";
import SongListItem from "@/components/SongListItem.vue";
import Player from "@/components/Player.vue";
import Collaborators from "@/components/collaborators.vue";
const defaultBackgrounds = [{
        filePath: "classic.svg",
        backgroundColor: "#F72D5C"
    },
    {
        filePath: "dua_lipa.svg",
        backgroundColor: "#F6BB6C"
    },
    {
        filePath: "mello.svg",
        backgroundColor: "#1754F6"
    }
];
export default {
    components: {
        SongListItem,
        Player,
        Collaborators,
    },
    data: () => ({
        showPopUp: false,
        appIsReady: false,
        youtubeLink: "https://www.youtube.com/watch?v=FUXX55WqYZs",
        maxListHeightStyle: null,
        userData: null,
        playlist: null,
        isUserPlaylistOwner: null,
        shouldYield: false,
        videoIdToVoteOut: null,
    }),

    mounted() {
        getCurrentUser().then(async res => {
            // set basic user data
            this.userData = res;
            this.appIsReady = true;
            return Promise.resolve();
        }).then(async res => {
            // handle playlist owner or guest
            const userPlaylistId = this.userData.data.playlistId;
            let playlistIdQuery = this.$route.query.playlist;
            if (!playlistIdQuery) {
                playlistIdQuery = userPlaylistId;
                this.setPath(playlistIdQuery)
            }
            this.isUserPlaylistOwner = playlistIdQuery === userPlaylistId;
            if (!this.isUserPlaylistOwner) {
                let collaboratorExists = this.collaborators.includes(this.userData.id);
                if (!collaboratorExists) {
                    this.updateCollaborators([...this.collaborators, this.userData.id], playlistIdQuery);
                }
            }
            await this.$bind('playlist', db.collection('playlists').doc(playlistIdQuery));
            if (!this.currentSong && this.upcomingSongs) this.playNext(null)
        });
        this.$nextTick().then(res => {
            if(!this.$refs.songsListRef) return;
            const pxFromTop = this.$refs.songsListRef.getBoundingClientRect()
                .top;
            const newSongStyle = window.getComputedStyle(this.$refs.newSongRef);
            const newSongHeight = [
                    "height",
                    "padding-top",
                    "padding-bottom",
                    "margin-top",
                    "margin-bottom"
                ]
                .map(key => parseInt(newSongStyle.getPropertyValue(key), 10))
                .reduce((prev, cur) => prev + cur);
            const fromHouse = 10;
            this.maxListHeightStyle = `calc(100vh - ${newSongHeight +
                pxFromTop +
                10}px)`;


        });
    },
    computed: {
        upcomingSongs() {
            return this.playlist && this.playlist.upcomingSongs ? this.playlist.upcomingSongs : []
        },
        currentSong() {
            return this.playlist ? this.playlist.currentSong : null
        },
        finishedSongs() {
            return this.playlist ? this.playlist.finishedSongs : null
        },
        likedSongs() {
            return this.playlist ? this.playlist.likedSongs : []
        },
        collaborators() {
            return this.playlist ? this.playlist.collaborators : []
        },
        currentTime() {
            return this.currentSong && this.currentSong.currentTime
        },
        defaultPoster() {
            if (this.currentSong) return;
            return defaultBackgrounds[
                (defaultBackgrounds.length * Math.random()) | 0
            ];
        },
        backgroundUrl() {
            if (!this.currentSong) return;
            const { maxres, high } = this.currentSong.thumbnails;
            if (maxres) return maxres.url;
            return high.url;
        },
        imageBackgroundStyle() {
            if (this.backgroundUrl) {
                return `background-image: url(${this.backgroundUrl})`;
            }
            return `background-color: ${this.defaultPoster.backgroundColor}`;
        },
        upcomingSongsData() {
            return this.upcomingSongs ? this.upcomingSongs.map(s => ({
                thumbnail: s.thumbnails.default,
                title: s.title,
                channelTitle: s.channelTitle,
                videoId: s.videoId,
                addedBy: s.addedBy,
                isPaused: s.isPaused
            })) : [];
        },
        playlistFbRef() {
            return this.userData && db.collection('playlists').doc(this.userData.data.playlistId)
        }
    },
    methods: {
        shouldRemoveSong(val) {
            this.showPopUp = !this.showPopUp;
            this.videoIdToVoteOut = val;
        },
        removeSong() {
            this.showPopUp = false;
            let value = this.videoIdToVoteOut
            if (!value) return
            let votes = 0
            let votedSongIndex = this.upcomingSongs.findIndex(x => x.videoId === value);
            let newArray = [...this.upcomingSongs]
            newArray[votedSongIndex] = { ...newArray[votedSongIndex] }
            let refinedArr = this.checkNumOfVotes(newArray, votedSongIndex, votes)
            this.updateUpcomingSongs(refinedArr)
        },
        updateTime(str) {
            if (!str) return
            this.updateCurrentSong({
                ...this.currentSong,
                currentTime: str
            })
        },

        checkNumOfVotes(newarr, index, newVote) {
            let numOfPeople = this.collaborators.length
            let numOfVotes = newVote
            //if (numOfVotes === (0 - numOfPeople)) {
            newarr.splice(index, 1)
            //}
            return newarr
        },
        historyToPlayNext() {
            this.finishedSongs.forEach((el, index, array) => {
                el.currentTime = 0
                array = this.upcomingSongs
                array.push(el)
                this.updateUpcomingSongs(array)
            });
            if (!this.currentSong) {
                this.playNext()
            }
        },
        likedSongsToPlayNext() {
            this.likedSongs.forEach((el, index, array) => {
                el.currentTime = 0
                array = this.upcomingSongs
                array.push(el)
                this.updateUpcomingSongs(array)
            })
            if (!this.currentSong) {
                this.playNext()
            }
        },
        songPaused(songState) {
            this.updateCurrentSong({
                ...this.currentSong,
                isPaused: songState
            })
        },
        setPath(id) {
            this.$router.push({ query: { playlist: id } }).catch(err => { console.log(err) });
        },
        getDefaultPoster(path) {
            return require(`@/assets/${path}`);
        },
        getYoutubeLink(link) {
            let videoId = link.split("=")[1];
            let addedBy = this.userData.id;
            let isPaused = null;
            return this.$http
                .get(
                    "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
                    videoId +
                    "&key=" +
                    ytApiKey
                )
                .then(response => {
                    const { snippet } = response.data.items[0];
                    const {
                        title,
                        publishedAt,
                        channelTitle,
                        thumbnails,
                    } = snippet;
                    const songData = {
                        title,
                        publishedAt,
                        channelTitle,
                        thumbnails,
                        videoId,
                        addedBy,
                        isPaused
                    };
                    return songData
                })
                .catch(error => console.log(error));
        },
        async addSong(songData) {
            let youtubeLink = this.youtubeLink;
            this.youtubeLink = null;
            let youtubeSongData = await this.getYoutubeLink(youtubeLink);
            if (!this.currentSong) {
                this.updateCurrentSong(youtubeSongData)
                return;
            }
            const newUpcomingValue = [...this.upcomingSongs, youtubeSongData]
            let addedLast = this.upcomingSongs[this.upcomingSongs.length - 1]
            let addingNow = youtubeSongData
            if (this.upcomingSongs.length !== 0 && addedLast.addedBy === addingNow.addedBy && this.collaborators.length > 0) {
                this.shouldYield = true
                setTimeout(() => { this.shouldYield = false }, 2500);
            } else {
                this.updateUpcomingSongs(newUpcomingValue);
            }
        },
        playNext(finishedSong) {
            let newUpcomingValue = this.upcomingSongs.slice(0)
            const toBePlayed = newUpcomingValue[0]
            if (!toBePlayed) {
                this.updateCurrentSong(null)
                return;
            };
            this.updateCurrentSong(toBePlayed)
            newUpcomingValue.splice(0, 1)
            if (finishedSong) {
                this.updateHistory([...this.finishedSongs, finishedSong])
                this.updateUpcomingSongs(newUpcomingValue)
            }
            this.updateUpcomingSongs(newUpcomingValue)
        },
        updateCurrentSong(newSongData) {
            let playlistIdQuery = this.$route.query.playlist;
            if (!this.isUserPlaylistOwner) {
                db.collection('playlists').doc(playlistIdQuery).update({
                    currentSong: newSongData
                })
            } else {
                this.playlistFbRef.update({
                    currentSong: newSongData
                })
            }
        },
        updateCollaborators(newValue, playlistId) {
            db.collection('playlists').doc(playlistId).update({
                collaborators: newValue
            })
        },
        updateUpcomingSongs(newValue) {
            let playlistIdQuery = this.$route.query.playlist;
            if (!this.isUserPlaylistOwner) {
                db.collection('playlists').doc(playlistIdQuery).update({
                    upcomingSongs: newValue
                })
            } else {
                this.playlistFbRef.update({
                    upcomingSongs: newValue
                })
            }

        },
        updateLikedSongs(newValue) {
            let exists = this.likedSongs.find(e => e.videoId == newValue.videoId)
            if (exists) return;
            const newLikedSong = [...this.likedSongs, newValue]
            this.playlistFbRef.update({
                likedSongs: newLikedSong
            })
        },
        updateHistory(newValue) {
            let playlistIdQuery = this.$route.query.playlist;
            if (!this.isUserPlaylistOwner) {
                db.collection('playlists').doc(playlistIdQuery).update({
                    finishedSongs: newValue
                })
            } else {
                this.playlistFbRef.update({
                    finishedSongs: newValue
                })
            }
        },
    },
};
</script>
<style lang="scss">
$baseRed: #590d19;
$baseShadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

:root {
    --main-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    --main-red: #590d19;
}

.partywithus {
    position: relative;
    display: flex;
    height: 100%;
    width: 100%;

    .song-postart {
        background-size: cover;
        background-color: black;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: scale(2.5) rotate(45deg);
        transform-origin: center center;
        background: rgba(black, 0.85);
        background-position: center center;
        background-repeat: no-repeat;

        &.default-cover {
            transform: scale(1) rotate(0deg);
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-height: 60vh;
                padding-left: 400px;
            }
        }
    }

    .ana-e-majt {
        max-height: 100%;
        position: relative;
        z-index: 1;
        flex: 1;
        flex-basis: 400px;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
        background-color: rgba(black, 0.85);
        backdrop-filter: blur(20px);
        box-shadow: $baseShadow;
        color: white;

        h1 {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .upnext {
            overflow-y: scroll;
        }

        .collabs {
            display: flex;

            >div {
                margin-right: 5px;
            }
        }

        .popup {
            background: red;
            border-radius: 2px;
            padding: 2px 10px;
        }

        .songs-list {
            display: block;
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }

        .slide-fade-enter-active {
            transition: all .3s ease;
        }

        .slide-fade-leave-active {
            transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }

        .slide-fade-enter,
        .slide-fade-leave-to

        /* .slide-fade-leave-active below version 2.1.8 */
            {
            transform: translateX(10px);
            opacity: 0;
        }
    }

    .ana-e-djatht {
        position: relative;
        z-index: 1;
        flex: 2;
    }

    .showSongPopup {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 1;
        background-color: #000000cf;

        >div {
            margin: auto;
            margin-top: 50px;
            background-color: #ffffffeb;
            height: max-content;
            width: max-content;
            display: flex;
            flex-direction: column;
            padding: 20px;
            align-items: center;
            border-radius: 5px;
            animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;

            >p {
                margin-top: 0;
                font-size: 18px;
                margin-bottom: 20px;
            }

            .buttons {
                cursor: pointer;
                margin: 0 10px;
                border: none;
                padding: 5px 20px;
                border-radius: 3px;
                outline: none;
                background: red;
                color: white;
                font-size: 14px;

                &:hover {
                    box-shadow: 0 0 3px 0 red;
                }

                &:active {
                    background: darkred;
                    transform: scale(0.9);
                }

                &:last-child {
                    background: white;
                    color: black;
                    font-weight: 500;

                    &:hover {
                        box-shadow: 0 0 3px 0 lightgray;
                    }

                    &:active {
                        background: gray;
                        transform: scale(0.9);
                    }
                }


            }

        }

    }

    .admin-buttons>button {
        padding: 5px 10px;
        border-radius: 5px;
        background: #00000063;
        color: white;
        font-weight: bold;
        cursor: pointer;
        outline: none;
        border: none;

        &:active {
            transform: scale(0.97);
            color: lightgray !important;
        }
    }
}

.add-new-song {
    border-top: solid 1px rgba(white, 0.3);
    padding-top: 10px;

    p {
        font-size: 14px;
        margin-top: 0px;
    }

    .paste-link-input {
        display: flex;
        align-items: center;
        position: relative;

        input {
            border: none;
            width: 100%;
            border-radius: 5px;
            font-size: 18px;
            padding: 10px;
            box-shadow: $baseShadow;
        }

        button {
            cursor: pointer;
            border: none;
            border-radius: 5px;
            padding: 4px 10px;
            background-color: rgba(black, 0.8);
            color: white;
            box-shadow: $baseShadow;
            position: absolute;
            right: 5px;
            font-weight: 500;
            font-size: 16px;
        }
    }
}

@keyframes scale-up-center {
    0% {
        transform: scale(0.5);
    }

    100% {
        transform: scale(1);
    }
}
</style>
<template>
    <div class="hello">
        <currentSong @ended="currentSongEnded" :nowPlaying="currentSong" v-if="currentSong"></currentSong>
        <upcomingSong :nextSongs="upcomingSongs"></upcomingSong>
        <input type="text" v-model="youtubeLink" placeholder="https://www.youtube.com/watch?v=2fngvQS_PmQ" style="border:solid 1px gray;padding:10px;width:400px; border-radius: 5px;font-size: 18px; margin:10px;">
        <button @click="getYoutubeLink">Enter</button>
    </div>
</template>
<script>
/* eslint-disable */
import currentSong from '@/pages/home/currentSong'
import upcomingSong from '@/pages/home/upcomingSong'
import axios from 'axios'

export default {
    name: 'home',
    components: {
        currentSong,
        upcomingSong
    },
    data: () => {
        return {
            youtubeLink: null,
            ytApiKey: 'AIzaSyC4Cun-uRQha90s5ZrggZNgnvokkaIai-g',
            currentSong: null,
            upcomingSongs: []
        }
    },
    methods: {
        getYoutubeLink() {
            let videoId = this.youtubeLink.split('=')[1];
            let videoName = '';
            this.$http.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + this.ytApiKey).then((response) => {
                videoName = response.data.items[0].snippet.title;
                this.addSong({ videoId, videoName });
            }).catch((error) => console.log(error));
            this.youtubeLink = '';
        },
        addSong(songData) {
            this.upcomingSongs.push(songData);
            if (!this.currentSong) {
                this.currentSong = this.upcomingSongs[0];
                this.upcomingSongs.splice(0, 1);
            }
        },
        currentSongEnded() {
        	if(!this.upcomingSongs[0]) return
            this.currentSong = this.upcomingSongs[0];
            this.upcomingSongs.splice(0, 1);
        }
    }

}
</script>
<style scoped>
</style>
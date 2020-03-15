<template>
    <div style="width:450px;margin:0 auto;">
        <div style="display: flex;align-items: center;justify-content: flex-start; border-bottom:solid 1px gray;" v-for="song in nextSongs" v-bind:key="song.videoId">
            <img alt="" :src="'https://img.youtube.com/vi/'+song.videoId+'/mqdefault.jpg'" height="50" width="70" style="border-radius: 5px; margin:0 10px;">
            <div>
                <h3 style="margin:5px 0;">{{song.videoName}}</h3>
                <p style="margin:5px 0">Added by: Aurora Selimi</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'upcomingSong',
    props:['nextSongs']
}
</script>
<style scoped>
</style>
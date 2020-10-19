<template>
    <div>
        <div class="profile-img" :style="imageBackgroundStyle" >
            <img  height="50" width="50" :src="getDefaultPoster(defaultPoster.filePath)" v-if="collaborator" alt="default-poster" />
        </div>
    </div>
</template>
<script>
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
    name: 'collaborators',
    props: ['collaborator'],
    computed:{
    	defaultPoster() {
            return defaultBackgrounds[
                (defaultBackgrounds.length * Math.random()) | 0
            ];
        },
        imageBackgroundStyle() {
            if (this.backgroundUrl) {
                return `background-image: url(${this.backgroundUrl})`;
            }
            return `background-color: ${this.defaultPoster.backgroundColor}`;
        },
    },
    methods:{
    	getDefaultPoster(path) {
            return require(`@/assets/${path}`);
        },
    }
}
</script>
<style>
.profile-img {
	height: 50px;
	width: 50px;
    border-radius: 100%;
    margin-right:10px;
}
</style>
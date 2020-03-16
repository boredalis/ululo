<template>
	<div class="partywithus">
		<div class="ana-e-majt">
			<div class="upnext">
				<h1>Up next</h1>
				<ul
					class="songs-list"
					:style="
						`max-height:${maxListHeightStyle}; overflow-y: auto;`
					"
					ref="songsListRef"
				>
					<SongListItem
						v-for="song in upcomingSongsData"
						:songProperties="song"
					/>
					<span v-if="!upcomingSongsData.length"
						>Looks empty in here...</span
					>
				</ul>
			</div>
			<div class="add-new-song" ref="newSongRef">
				<p>
					Its your time to shine, add the next song  to our playlist:
				</p>
				<div class="paste-link-input">
					<input
						type="text"
						v-model="youtubeLink"
						placeholder="https://youtube.com/urh34/"
					/>
					<button @click="getYoutubeLink()">Add</button>
				</div>
			</div>
		</div>
		<div class="ana-e-djatht">
			<Player
				:currentSong="currentSong"
				@ended="playNext()"
				v-if="currentSong"
			/>
		</div>
		<div
			class="song-postart"
			:style="imageBackgroundStyle"
			:class="{ 'default-cover': !currentSong }"
		>
			<img
				:src="getDefaultPoster(defaultPoster.filePath)"
				v-if="!currentSong"
				alt="default-poster"
			/>
		</div>
	</div>
</template>
<script>
const ytApiKey = "AIzaSyC4Cun-uRQha90s5ZrggZNgnvokkaIai-g";
import SongListItem from "@/components/SongListItem.vue";
import Player from "@/components/Player.vue";
const defaultBackgrounds = [
	{
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
	},
	{
		filePath: "workstation.svg",
		backgroundColor: "#455272"
	}
];

export default {
	components: {
		SongListItem,
		Player
	},
	data: () => ({
		songs: [],
		currentSong: null,
		upcomingSongs: [],
		history: [],
		youtubeLink: "https://www.youtube.com/watch?v=FUXX55WqYZs",
		maxListHeightStyle: null
	}),
	mounted() {
		this.$nextTick().then(res => {
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

			console.log({ pxFromTop, newSongHeight });
			const fromHouse = 10;
			this.maxListHeightStyle = `calc(100vh - ${newSongHeight +
				pxFromTop +
				10}px)`;
		});
	},
	computed: {
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
			return this.upcomingSongs.map(s => ({
				thumbnail: s.thumbnails.default,
				title: s.title,
				channelTitle: s.channelTitle
			}));
		}
	},
	methods: {
		getDefaultPoster(path) {
			return require(`@/assets/${path}`);
		},
		getYoutubeLink() {
			let videoId = this.youtubeLink.split("=")[1];
			this.$http
				.get(
					"https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
						videoId +
						"&key=" +
						ytApiKey
				)
				.then(response => {
					console.log("Video response:", response);
					const { snippet } = response.data.items[0];
					const {
						title,
						publishedAt,
						channelTitle,
						thumbnails
					} = snippet;
					const songData = {
						title,
						publishedAt,
						channelTitle,
						thumbnails,
						videoId
					};
					this.addSong(songData);
				})
				.catch(error => console.log(error));
			this.youtubeLink = null;
		},
		addSong(songData) {
			this.upcomingSongs.push(songData);
			if (!this.currentSong) {
				this.currentSong = this.upcomingSongs[0];
				this.upcomingSongs.splice(0, 1);
			}
		},
		playNext() {
			if (!this.upcomingSongs[0]) return;
			this.currentSong = this.upcomingSongs[0];
			this.upcomingSongs.splice(0, 1);
		}
	}
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
	}
	.ana-e-djatht {
		position: relative;
		z-index: 1;
		flex: 2;
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
</style>

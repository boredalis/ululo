<template>
	<li>
		<div class="song">
			<div
				class="rectangle-cover"
				:style="
					`background-image: url(${songProperties.thumbnail.url})`
				"
			></div>
			<div class="song-info">
				<p>{{ songProperties.title }}</p>
				<span>Added by {{ songProperties.addedBy || "you" }}</span>
			</div>
		</div>
	</li>
</template>
<script>
export default {
	props: ["songProperties"]
};
</script>
<style lang="scss">
.rectangle-cover {
	background: white;
	margin-right: 10px;
	width: 64px;
	height: 64px;
	background-size: cover;
	background-position: center center;
	border-radius: 4px;
	flex-shrink: 0;
}

.song {
	display: flex;
	align-items: center;
	margin-top: 10px;
}
.song-info {
	max-width: 100%;
	overflow: hidden;
	span {
		margin-top: 0px;
		font-style: italic;
		font-size: 13px;
	}
	p {
		margin: 0px;
	}
	p,
	span {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
}
</style>

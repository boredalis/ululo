<template>
    <li>
        <div class="song">
            <div class="rectangle-cover" :style="
                    `background-image: url(${songProperties.thumbnail.url})`
                "></div>
            <div class="song-info">
                <p>{{ songProperties.title }}</p>
                <span>Added by {{ songProperties.addedBy || "you" }}</span>
            </div>
            <div class="vote">
                <div v-if="isVoted" :style="styleObject">{{votes}}</div>
                <div v-else>
                    <ThumbsUpIcon @click="vote('upvote')" size="20" stroke-width="1" stroke="black" fill="#57ca57"></ThumbsUpIcon>
                    <ThumbsDownIcon @click="vote('downvote')" size="20" stroke-width="1" stroke="black" fill="#ff4444"></ThumbsDownIcon>
                </div>
            </div>
        </div>
    </li>
</template>
<script>
import {
    ThumbsUpIcon,
    ThumbsDownIcon
} from "vue-feather-icons";
export default {
    props: ["songProperties"],
    components: {
        ThumbsUpIcon,
        ThumbsDownIcon
    },
    watch: {
        songProperties(val) {
            if (val.votes === null) this.isVoted = false
        }
    },
    computed: {
        votes() {
            return this.songProperties ? this.songProperties && this.songProperties.votes : null
        },
    },
    data: () => ({
        isVoted: false,
        styleObject: {
            color: '',
            fontSize: '13px'
        }
    }),
    methods: {
        vote(payload) {
            let votes
            if (this.votes) {
                votes = this.votes
            } else {
                votes = 0
            }
            if (payload === 'upvote') {
                votes += 1
                this.$emit("voted", [votes, this.songProperties.videoId]);
            } else if (payload === 'downvote') {
                votes -= 1
                this.$emit("voted", [votes, this.songProperties.videoId]);
            }

            if (votes >= 0) {
                this.styleObject.color = "orange"
            } else {
                this.styleObject.color = "blue"
            }
            this.isVoted = true
        },
    },
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
    justify-content: space-between;
}

.vote {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 10px;

    >div:first-child {
        text-align: center;
    }

    >div:last-child {
        cursor: pointer;

        >svg:first-child {
            margin-bottom: 5px;

        }
    }
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
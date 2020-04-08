<template>
    <div>
        <div>
            <img src="@/assets/mello.svg" width="50px" class="img">
        </div>
    </div>
</template>
<script>
export default {
    name: 'collaborators',
    props: ['collaborator'],
}
</script>
<style>
.img {
    border-radius: 100%;
}
</style>
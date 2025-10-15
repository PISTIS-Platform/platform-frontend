<template>
    <div class="digit-container">
        <div class="digit-window">
            <div class="digit-strip" :style="{ transform: `translateY(-${currentPosition}%)` }">
                <div v-for="n in 10" :key="n - 1" class="digit">
                    {{ n - 1 }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
    // Duration for one complete cycle (0-9) in milliseconds
    cycleDuration: {
        type: Number,
        default: 1000,
    },
    // Whether to start animation automatically
    autoStart: {
        type: Boolean,
        default: true,
    },
});

const currentPosition = ref(0);
let animationFrame = null;
let startTime = null;

const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = (elapsed % props.cycleDuration) / props.cycleDuration;

    // Move from 0 to 9 (0% to 90% of the strip)
    currentPosition.value = progress * 90;

    animationFrame = requestAnimationFrame(animate);
};

const start = () => {
    if (!animationFrame) {
        startTime = null;
        animationFrame = requestAnimationFrame(animate);
    }
};

const stop = () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        startTime = null;
    }
};

onMounted(() => {
    if (props.autoStart) {
        start();
    }
});

onUnmounted(() => {
    stop();
});

// Expose methods for manual control
defineExpose({ start, stop });
</script>

<style scoped>
.digit-container {
    display: inline-block;
    vertical-align: baseline;
    line-height: 1;
}

.digit-window {
    display: inline-block;
    width: 0.6em;
    height: 1.2em;
    overflow: hidden;
    position: relative;
    vertical-align: baseline;
}

.digit-strip {
    will-change: transform;
    position: relative;
}

.digit {
    height: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
}
</style>

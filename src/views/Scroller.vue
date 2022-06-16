<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import Locomotive from '@/utils/scroller/Main';
import { onMounted, onBeforeUnmount, nextTick, watch } from '@vue/runtime-dom';
import { useScrollData } from '@/store/scrollData';

const scrollData = useScrollData();

let scroll: {
  update: () => void;
  destroy: () => void;
  on: (event: string, cb: (e: unknown) => void) => void;
};

interface ScrollerProps {
  direction?: 'horizontal' | 'vertical';
  dependencies?: any;
}

const props = withDefaults(defineProps<ScrollerProps>(), {
  direction: 'horizontal',
});

const mainRef = ref<HTMLElement | null>(null);

const initLocomotive = () => {
  if (mainRef.value) {
    // document.addEventListener('DOMContentLoaded', () => {
    console.log(props.direction);
    scrollData.init({
      el: mainRef.value,
      smooth: true,
      getDirection: true,
      getSpeed: true,
      direction: props.direction,
      gestureDirection:
        props.direction === 'vertical' ? props.direction : 'both',
      reloadOnContextChange: true,
      repeat: true,
      scrollFromAnywhere: true,
      // smartphone: {
      //   direction: 'vertical',
      //   gestureDirection: 'vertical',
      // },
    });

    // scroll.on('scroll', (e) => {
    //   console.log(
    //     e,
    //     document.documentElement.offsetWidth,
    //     document.documentElement.offsetHeight
    //   );
    //   // console.log(scroll);
    // });

    nextTick(() => {
      setTimeout(() => {
        console.log('update scroll');
        scrollData.update();
      }, 300);
    });
    // });
  }
};

// watchEffect(() => {
//   if (mainRef.value && scroll) {
//     setTimeout(() => {
//       console.log('update scroll');
//       scroll.update();
//     }, 300);
//   }
// });

// const setupUpdateDeps = () => {
//   if (props?.dependencies && props.dependencies?.length > 0) {
//     console.warn('setup update deps');
//     props.dependencies.forEach((dep) => {
//       watch(
//         () => dep,
//         () => {
//           console.log('dependency chande, updating scroller');
//           if (scroll) {
//             nextTick(() => {
//               scroll.update();
//             });
//           }
//         }
//       );
//     });
//   }
// };

if (props.dependencies) {
  watch(
    () => props?.dependencies,
    () => {
      console.log('scroller dependency changed');
      if (scroll) {
        setTimeout(() => {
          console.log('update scroll');
          scroll.update();
        }, 300);
      }
    }
  );
}

// setupUpdateDeps();

onMounted(() => {
  console.log('onMounted scroller');
  initLocomotive();
  // setupUpdateDeps();
});

onBeforeUnmount(() => {
  if (scrollData.scroller) {
    console.log('destroy scroll');
    scrollData.destroy();
  }
});
</script>

<template>
  <div id="scroller" ref="mainRef" data-scroll-container>
    <slot></slot>
  </div>
</template>

<style lang="sass" scoped>
div#scroller
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: 1
  // display: flex
</style>

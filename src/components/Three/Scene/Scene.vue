<template>
  <div
    id="scene"
    class="scene"
  />
</template>

<script>
import * as Three from 'three';

import { mapActions, mapGetters } from 'vuex';

// Controls
import { PointerLockControls } from '@/components/Three/Modules/Controls/PointerLockControls';
// import { OrbitControls } from '@/components/Three/Modules/Controls/OrbitControls';

// Postprocessing
// import { EffectComposer } from '@/components/Three/Modules/Postprocessing/EffectComposer';
// import { RenderPass } from '@/components/Three/Modules/Postprocessing/RenderPass';
// import { FilmPass } from '@/components/Three/Modules/Postprocessing/FilmPass';

// Stats
import Stats from '@/components/Three/Modules/Utils/Stats';

import { DESIGN, OBJECTS } from '@/utils/constants';
import {
  // messagesByIdDispatchHelper,
  // messagesByViewDispatchHelper,
  loaderDispatchHelper,
} from '@/utils/utilities';

export default {
  name: 'Scene',

  data() {
    return {
      renderer: null,
      // composer: null,

      scene: null,

      camera: null,

      controls: null,
      // mouse: null,

      clock: null,
      delta: null,

      height: DESIGN.HERO.height,
      startDirection: null,
    };
  },

  mounted() {
    this.startDirection = new Three.Vector3(-0.7071067758832469, 0, -0.7071067864898483);

    this.clock = new Three.Clock();

    this.init();
    this.animate();

    loaderDispatchHelper(this.$store, 'emptyProjectField');
  },

  created() {
    this.$eventHub.$on('lock', this.lock);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    document.removeEventListener('keydown', this.onKeyDown, false);
    document.removeEventListener('keyup', this.onKeyUp, false);
    // document.removeEventListener('mousemove', this.onMouseMove, false);

    // eslint-disable-next-line no-underscore-dangle
    if (this.$eventHub._events.lock) this.$eventHub.$off('lock');
  },

  computed: {
    ...mapGetters({
      isGameLoaded: 'preloader/isGameLoaded',

      isPause: 'layout/isPause',

      messages: 'layout/messages',
      message: 'layout/message',
    }),

    isKeysLock() {
      return this.isPause;
    },
  },

  methods: {
    ...mapActions({
      togglePause: 'layout/togglePause',

      addMessage: 'layout/addMessage',
      showMessage: 'layout/showMessage',
      hideMessageByView: 'layout/hideMessageByView',
    }),

    init() {
      // Container
      const container = document.getElementById('scene');

      // Renderer

      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);

      // Scene

      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(DESIGN.COLORS.background0x);

      // Туман
      this.scene.fog = new Three.Fog(DESIGN.COLORS.fog0x, DESIGN.GROUND_SIZE / 10, DESIGN.GROUND_SIZE / 2);

      // Cameras

      this.camera = new Three.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, DESIGN.GROUND_SIZE);

      // Controls

      // In First Person

      this.controls = new PointerLockControls(this.camera, this.renderer.domElement);

      this.controls.addEventListener('unlock', () => {
        this.togglePause(true);
      });

      this.controls.addEventListener('lock', () => {
        this.togglePause(false);
      });

      this.setInFirstPersonControls();

      this.setToStart();

      this.camera.lookAt(this.startDirection.multiplyScalar(1000));

      this.scene.add(this.controls.getObject());

      this.scene.add(this.camera);

      // Atmosphere
      // this.atmosphere = new Atmosphere();
      // this.atmosphere.init(this);

      // Listeners
      window.addEventListener('resize', this.onWindowResize, false);
      document.addEventListener('keydown', this.onKeyDown, false);
      document.addEventListener('keyup', this.onKeyUp, false);
      // document.addEventListener('mousemove', this.onMouseMove, false);

      // Postprocessing
      // const renderModel = new RenderPass(this.scene, this.cameraDrone);
      // const effectFilm = new FilmPass(1, 2, 1024, false);

      // this.composer = new EffectComposer(this.renderer);

      // this.composer.addPass(renderModel);
      // this.composer.addPass(effectFilm);

      // Stats
      this.stats = new Stats();
      container.appendChild(this.stats.dom);

      // First render
      this.render();
    },

    setInFirstPersonControls() {
      // In first person controls with pointer lock API
      this.controls.getObject().position.y = this.height;
    },

    setToStart() {
      // Стартовая точка (или переместиться в точку при работе с миром)
      this.controls.getObject().position.x = DESIGN.HERO.start[0];
      this.controls.getObject().position.z = DESIGN.HERO.start[1];
      this.controls.getObject().position.y = this.height;
    },

    lock() {
      this.controls.lock();
    },

    /* onMouseMove(event) {
      calculate mouse position in normalized device coordinates
      (-1 to +1) for both components
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, */

    // eslint-disable-next-line no-unused-vars
    onKeyDown(event) {
    },

    onKeyUp(event) {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
        case 80: // P
          if (this.isPause) {
            this.controls.lock();
          } else this.controls.unlock();
          break;

        case 27: // Ecs
          this.togglePause(!this.isPause);
          break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      this.delta = this.clock.getDelta();

      if (!this.isKeysLock) {
        // Зависнуть над сценой (+ отключи Притяжение в Hero.js и сделай Туман дальше (последнее знаение far больше))
        // this.controls.getObject().position.y = 1000;

        // console.log(this.renderer.info);
        // console.log(this.controls.getObject().position.x, this.controls.getObject().position.z);

        // Atmosphere
        // this.atmosphere.animate(this);
      } else {
        // this.atmosphere.stop();
      }

      if (!this.isPause) this.render();

      this.stats.update();
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // this.composer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
      this.renderer.render(this.scene, this.camera);
      // this.composer.render();
    },
  },

  watch: {
  },
};
</script>

<style scoped>
.scene {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}
</style>

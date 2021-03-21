import * as Three from 'three';

import { GLTFLoader } from '@/components/Three/Modules/Utils/GLTFLoader';

import { DESIGN } from '@/utils/constants';

import {
  loaderDispatchHelper,
} from '@/utils/utilities';

function World() {
  const loader = new GLTFLoader();

  this.init = (scope) => {
    // Lights

    // Hemisphere
    const light = new Three.HemisphereLight(0xffffaa, 0x000000, 0.5);
    light.position.set(0, DESIGN.GROUND_SIZE / 4, 0).normalize();
    scope.scene.add(light);

    // Ambient
    scope.scene.add(new Three.AmbientLight(0x555555));

    const directionalLight = new Three.DirectionalLight(0xffffaa, 1);
    directionalLight.position.set(- 5, 25, - 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top	= 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    scope.scene.add(directionalLight);

    // World

    const texture = new Three.TextureLoader().load('./images/textures/concrete.jpg', () => {
      scope.render();
      loaderDispatchHelper(scope.$store, 'isConcreteLoaded');
    });

    loader.load('./images/models/World.glb', (gltf) => {
      scope.octree.fromGraphNode(gltf.scene);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material.map) {
            child.material.map.anisotropy = 8;
          }

          child.material.map = texture;
          child.material.map.repeat.set(0.05, 0.05);
          child.material.map.wrapS = child.material.map.wrapT = Three.RepeatWrapping;
          child.material.map.encoding = Three.sRGBEncoding;
        }
      });

      scope.scene.add(gltf.scene);
      scope.render();
      loaderDispatchHelper(scope.$store, 'isWorldLoaded');
    });
  };
}

export default World;

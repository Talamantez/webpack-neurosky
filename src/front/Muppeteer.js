import * as THREE from 'three';

let Muppeteer = function(){
  console.log('initializing muppeteer')
  var self = this;
  // THREE.js stuff
  self.container;
  self.camera;
  // self.controls;
  self.scene;
  self.renderer;
  self.geometry;
  self.difference;
  self.light;
  self.objects = [];
  self.init = function() {
      self.container = document.getElementById('container');
      self.wrap = document.getElementById('wrapper');
      self.wrap.appendChild(self.container);

      self.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
      self.camera.position.z = 1000;

      self.scene = new THREE.Scene();
      self.scene.background = new THREE.Color(0xf0f0f0);
      self.scene.add(new THREE.AmbientLight(0x505050));

      self.light = new THREE.SpotLight(0xffffff, 1.5);
      self.light.position.set(0, 500, 2000);
      self.light.castShadow = true;
      self.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
      self.light.shadow.bias = -0.00022;
      self.light.shadow.mapSize.width = 2048;
      self.light.shadow.mapSize.height = 2048;
      self.scene.add(self.light);

      self.geometry = new THREE.BoxGeometry(40, 40, 40);
      self.renderer = new THREE.WebGLRenderer({ antialias: true });
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.setSize(window.innerWidth, window.innerHeight);
      self.renderer.shadowMap.enabled = true;
      self.renderer.shadowMap.type = THREE.PCFShadowMap;

      self.container.appendChild(self.renderer.domElement);

      window.addEventListener('resize', self.onWindowResize, false);

      self.render = function() {
          // controls.update();
          // console.log('rendering 3js scene')
          self.renderer.render(self.scene, self.camera);

      }
      self.onWindowResize = function() {

          self.camera.aspect = window.innerWidth / window.innerHeight;
          self.camera.updateProjectionMatrix();

          self.renderer.setSize(window.innerWidth, window.innerHeight);

      }

      self.animate();
  }

  self.drawCubes = function(geometry, attention, objects) {
          console.log('drawing cubes');
          if(self.scene){
            if(self.scene.children){
              while(self.scene.children.length > 0){
                self.scene.remove(self.scene.children[0]);
              }
            }
          }

          if(self.container){
            // console.dir(self.container);
          }else{
            console.log('self.container not found')
          }
          console.dir(self.scene);
          self.scene.add(new THREE.AmbientLight(0x505050));

          self.light = new THREE.SpotLight(0xffffff, 1.5);
          self.light.position.set(0, 500, 2000);
          self.light.castShadow = true;
          self.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
          self.light.shadow.bias = -0.00022;
          self.light.shadow.mapSize.width = 2048;
          self.light.shadow.mapSize.height = 2048;
          self.scene.add(self.light);
          for (let i = 0; i < attention; i++) {
              let object = new THREE.Mesh(self.geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

              object.position.x = Math.random() * 1000 - 500;
              object.position.y = Math.random() * 600 - 300;
              object.position.z = Math.random() * 800 - 400;

              object.rotation.x = Math.random() * 2 * Math.PI;
              object.rotation.y = Math.random() * 2 * Math.PI;
              object.rotation.z = Math.random() * 2 * Math.PI;

              object.scale.x = Math.random() * 2 + 1;
              object.scale.y = Math.random() * 2 + 1;
              object.scale.z = Math.random() * 2 + 1;

              object.castShadow = true;
              object.receiveShadow = true;
              object.name = 'cube' + i;

              self.scene.add(object);
              self.objects.push(object);
      }
  }

  self.animate = function() {
      // console.log('animating');
      requestAnimationFrame(self.animate);
      self.render();
  }

  self.init();
}

export default Muppeteer;

import * as THREE from 'three'

class Graphics {
  constructor(){
    this.container;
    this.camera;
    this.scene;
    this.renderer;
    this.geometry;
    this.difference;
    this.light;
    this.objects = [];
    this.init = function() {
        this.container = document.getElementById('container');
        this.wrap = document.getElementById('wrapper');
        this.wrap.appendChild(this.container);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 1000;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.add(new THREE.AmbientLight(0x505050));

        this.light = new THREE.SpotLight(0xffffff, 1.5);
        this.light.position.set(0, 500, 2000);
        this.light.castShadow = true;
        this.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
        this.light.shadow.bias = -0.00022;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.scene.add(this.light);

        this.geometry = new THREE.BoxGeometry(40, 40, 40);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onWindowResize, false);

        this.render = function() {
            // controls.update();
            // console.log('rendering 3js scene')
            this.renderer.render(this.scene, this.camera);

        }
        this.onWindowResize = function() {

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

        }

        this.animate();
    }

    this.drawCubes = function(geometry, attention, objects) {
            console.log('drawing cubes');
            if(this.scene){
              if(this.scene.children){
                while(this.scene.children.length > 0){
                  this.scene.remove(this.scene.children[0]);
                }
              }
            }
            this.scene.add(new THREE.AmbientLight(0x505050));

            this.light = new THREE.SpotLight(0xffffff, 1.5);
            this.light.position.set(0, 500, 2000);
            this.light.castShadow = true;
            this.light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
            this.light.shadow.bias = -0.00022;
            this.light.shadow.mapSize.width = 2048;
            this.light.shadow.mapSize.height = 2048;
            this.scene.add(this.light);

            for (let i = 0; i < attention; i++) {
                let object = new THREE.Mesh(this.geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

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

                this.scene.add(object);
                this.objects.push(object);
        }
    }

    this.animate = function() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    this.init();
  }
}

export default Graphics

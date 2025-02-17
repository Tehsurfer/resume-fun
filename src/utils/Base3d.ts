import * as THREE from 'three'
import { Clock, PerspectiveCamera, Scene, WebGLRenderer, AnimationMixer } from 'three'
import Stats from 'stats.js'
// 导入控制器，轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入模型解析器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

class Base3d {
  public container: HTMLElement
  public camera: PerspectiveCamera
  public scene: Scene
  public font: any
  public stats
  public clock: Clock
  public renderer: WebGLRenderer
  public controls: OrbitControls
  public mixer: AnimationMixer | null

  constructor(selector: string) {
    this.container = document.querySelector(selector) as HTMLElement
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( 0, 200, - 400 );
    this.scene = new THREE.Scene()
    this.stats = new Stats()
    this.clock = new THREE.Clock()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.mixer = null
    this.font = null
    this.init()
  }

  init() {
    this.initStats()
    // 初始化渲染器
    this.initRenderer()
    // 初始化场景
    this.initScene()
    // 初始化相机
    this.initCamera()
    // 控制器
    this.initControls()
    // 添加物体
    this.creatWorld()
    // 监听场景大小改变，调整渲染尺寸
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  initStats() {
    this.container.appendChild(this.stats.dom)
  }

  initScene() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    this.scene.background = new THREE.Color( 0xcccccc );
	  this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  }

  initCamera() {
    this.camera.position.set(5, 2, 8)
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0.5, 0)
    this.controls.update()
    this.controls.enablePan = true
    this.controls.enableDamping = true
  }

  initRenderer() {
    // 设置屏幕像素比
    this.renderer.setPixelRatio(window.devicePixelRatio)
    // 渲染的尺寸大小
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.container.appendChild(this.renderer.domElement)
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this))
    const delta = this.clock.getDelta()
    this.mixer?.update(delta)
    this.controls.update()
    this.stats.update()
    this.renderer.render(this.scene, this.camera)
  }

  creatWorld() {
    const geometry = new THREE.BoxGeometry();
    geometry.translate( 0, 0.5, 0 );
    const material = new THREE.MeshPhongMaterial( { color: 0xeeeeee, flatShading: true } );
    const textMaterial = new THREE.MeshPhongMaterial( { color: 0x8f1856, flatShading: false } );
    var loader = new FontLoader();


    loader.load( 'font/helvetiker.typeface.json', (font) =>  {
      

      for ( let i = 0; i < 500; i ++ ) {

        const mesh = new THREE.Mesh( geometry, material );
        const posx = Math.random() * 1600 - 800; 
        const posz = Math.random() * 1600 - 800;
        mesh.position.x = posx;
        mesh.position.y = 0;
        mesh.position.z = posz;
        mesh.scale.x = 20;
        mesh.scale.y = Math.random() * 80 + 10;
        mesh.scale.z = 20;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;

        if(i%10 === 0) {

          const text = new TextGeometry('Keep Looking...', {
            font: font,
            size: 80,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
          })
          let textMesh = new THREE.Mesh(text, material)
          textMesh.position.x = posx;
          textMesh.position.y = 0;
          textMesh.position.z = posz;
          textMesh.scale.x = .2;
          textMesh.scale.y = .2;
          textMesh.scale.z = .2;
          this.scene.add(textMesh)

          const light = new THREE.PointLight( 0xff0000, 1, 100 );
          light.position.set( posx, 3, posz);
          this.scene.add( light );
        }
        this.scene.add( mesh );

      }
    })

    this.animate()
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

export default Base3d

import * as THREE from 'three'
import { Clock, PerspectiveCamera, Scene, WebGLRenderer, AnimationMixer } from 'three'
import Stats from 'stats.js'
// 导入控制器，轨道控制器
import { MapControls } from '../utils/MapControls.js'
import {QuoteProcessing} from './quoteProcessing.js'
// 导入模型解析器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import quotes from '../assets/quotes.js'

class Base3d {
  public container: HTMLElement
  public camera: PerspectiveCamera
  public scene: Scene
  public font: any
  public qouteProcessor: QuoteProcessing
  public stats
  public clock: Clock
  public renderer: WebGLRenderer
  public controls: MapControls
  public mixer: AnimationMixer | null
  public textMeshList: any

  constructor(selector: string) {
    this.container = document.querySelector(selector) as HTMLElement
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( 0, -200, - 300 );
    this.scene = new THREE.Scene()
    this.stats = new Stats()
    this.clock = new THREE.Clock()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.controls = new MapControls(this.camera, this.renderer.domElement)
    this.qouteProcessor = new QuoteProcessing(quotes)
    this.textMeshList = []
    this.mixer = null
    this.font = null
    this.init()
  }o

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
    this.createWorld()
    // 监听场景大小改变，调整渲染尺寸
    window.addEventListener('resize', this.onWindowResize.bind(this))

    setTimeout( ()=>this.updateTextMeshPositions(), 2500)
  }

  initStats() {
    this.container.appendChild(this.stats.dom)
  }

  initScene() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    this.scene.background = new THREE.Color( 0xcccccc );
	  this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
    const ambLight = new THREE.AmbientLight(0x8f1856, 0.001)
    this.scene.add(ambLight)

  }

  initCamera() {
    this.camera.position.set(5, 2, 8)
  }

  initControls() {
    this.controls = new MapControls(this.camera, this.renderer.domElement)
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

  animate(t) {
    window.requestAnimationFrame(this.animate.bind(this))
    const delta = this.clock.getDelta()
    this.mixer?.update(delta)
    this.controls.update()
    this.stats.update()
    this.scene.traverse((obj) => {
      if (obj.onBeforeRender) obj.onBeforeRender(this.renderer, this.scene, this.camera)
    })
    this.renderer.render(this.scene, this.camera)
  }

  createWorld() {
    const geometry = new THREE.BoxGeometry();
    geometry.translate( 0, 0.5, 0 );
    const material = new THREE.MeshPhongMaterial( { color: 0xeeeeee, flatShading: true } );
    const textMaterial = new THREE.MeshPhongMaterial( { color: 0x8f1856, flatShading: false } );
    var loader = new FontLoader();

    let vQuotes = this.qouteProcessor.stackQuotesVertically()


    loader.load( 'font/helvetiker.typeface.json', (font) =>  {
      

      for ( let i = 0; i < 100; i ++ ) {

        const mesh = new THREE.Mesh( geometry, material );
        const posx = Math.random() * 1600 - 800; 
        const posz = Math.random() * 1600 - 800;
        mesh.position.x = posx;
        mesh.position.y = 0;
        mesh.position.z = posz;
        mesh.scale.x = 20;
        mesh.scale.y = Math.random() * 80 + 10;
        mesh.scale.z = 20;
        mesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0), Math.random()*3)
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        this.scene.add( mesh );

      }
      for (let i=0; i<= vQuotes.length/100; i++){
        const randomQoute = Math.floor(Math.random()*vQuotes.length)
        const text = new TextGeometry(vQuotes[randomQoute].Quote, {
          font: font,
          size: 80,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 5,
          bevelSize: 4,
          bevelOffset: 0,
          bevelSegments: 5
        })
        let textMesh = new THREE.Mesh(text, textMaterial)
        let textx = Math.random() * 1600 - 800;
        let textz = Math.random() * 1600 - 800;
        textMesh.position.x = textx;
        textMesh.position.y = 0;
        textMesh.position.z = textz;
        textMesh.scale.x = .05;
        textMesh.scale.y = .05;
        textMesh.scale.z = .05;
        textMesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0), Math.random()*3)
        this.scene.add(textMesh)
        this.textMeshList.push(textMesh)

        const light = new THREE.PointLight( 0xff0000, 1, 100 );
        light.position.set( textx - 10, 4, textz - 10);
        light.position.set( textx + 10, 4, textz - 10);
        light.position.set( textx + 20, 6, textz + 20);
        light.position.set( textx - 20, 6, textz - 20);
        this.scene.add( light );
      }
    })

    this.animate()
  }

  

  updateTextMeshPositions() {
    this.textMeshList.forEach(mesh => {
      let yheight = mesh.geometry.boundingSphere.radius /10
      mesh.position.y = yheight
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

export default Base3d

import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { gsap } from 'gsap'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 4

const renderer = new THREE.WebGLRenderer({ 
  canvas: document.querySelector('canvas'),
  antialias: true,
  alpha: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.uniforms['amount'].value = 0.0020 
composer.addPass(rgbShiftPass)


const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 10, 7.5)
scene.add(directionalLight)

const rgbeLoader = new RGBELoader()
const hdriPath = 'night4k.hdr'
rgbeLoader.load(
  hdriPath,
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
  },
  undefined,
  function (error) {
    console.error('Error loading HDRI environment', error)
  }
)

let model = null

const mouse = { x: 0, y: 0 }
const targetRotation = { x: 0, y: 0 }

const cameraTarget = { x: 0, y: 0 }  
const cameraCurrent = { x: 0, y: 0 } 

function onMouseMove(event) {
  const normX = (event.clientX / window.innerWidth) * 2 - 1
  const normY = ((event.clientY / window.innerHeight) * 2 - 1) 

  gsap.to(targetRotation, {
    x: normY * 0.3,
    y: normX * 0.6,
    duration: 1,
    ease: 'power2.out'
  })

  gsap.to(cameraTarget, {
    x: normY * 0.03,
    y: normX * 0.06,
    duration: 1,
    ease: 'power2.out'
  })
}

const gltfLoader = new GLTFLoader()
gltfLoader.load(
  'damagedHelmet.gltf',
  (gltf) => {
    scene.add(gltf.scene)
    gltf.scene.position.set(0, 0, 0)
    model = gltf.scene
    model.rotation.x = 0
    model.rotation.y = 0
  },
  undefined,
  (error) => {
    console.error('Error loading GLTF model', error)
  }
)

window.addEventListener('mousemove', onMouseMove)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)

  if (model) {
    model.rotation.x += (targetRotation.x - model.rotation.x) * 0.18
    model.rotation.y += (targetRotation.y - model.rotation.y) * 0.18
  }

  camera.rotation.x += (cameraTarget.x - camera.rotation.x) * 0.12
  camera.rotation.y += (cameraTarget.y - camera.rotation.y) * 0.12

  composer.render()
}
animate()

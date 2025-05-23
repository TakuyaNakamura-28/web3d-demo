import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
// import type {Object3DEventMap} from "three";

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))
const light = new THREE.DirectionalLight(0xffffff, 10)
// light.position.set(0.8, 1.4, 1.0)
scene.add(light)
const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

new OrbitControls(camera, renderer.domElement)


const geometry = new THREE.BoxGeometry(1, 0.01, 1, 5, 1, 5)
const material = new THREE.MeshNormalMaterial({ wireframe: true })

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)


const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()

const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 20)

const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()


let modelReady = false

const fbxLoader = new FBXLoader()
let mixer: THREE.AnimationMixer
const animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction
// let originalCharacter: THREE.Group<Object3DEventMap>
// let alternateCharacter: THREE.Group<Object3DEventMap>

fbxLoader.load(
    'jump.fbx',
    (object) => {
        // object.traverse(function (child) {
        //     if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
        //     }
        // })
        object.scale.set(.005, .005, .005)
        mixer = new THREE.AnimationMixer(object)

        const animationAction = mixer.clipAction(
            (object as THREE.Object3D).animations[0]
        )
        animationActions.push(animationAction)
        animationsFolder.add(animations, 'default')
        activeAction = animationActions[0]
        activeAction.play()

        scene.add(object)
        // originalCharacter = object
        modelReady = true


        fbxLoader.load("Jog In Circle.fbx",
            (object) => {

                const animationAction = mixer.clipAction(
                    (object as THREE.Object3D).animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'alternate')

                scene.add(object)

                modelReady = true
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)


// fbxLoader.load("character.fbx",
//     (object) => {
//         object.scale.set(.005, .005, .005)
//         alternateCharacter = object
//         animationsFolder.add(animations, 'swapCharacter')
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//     },
//     (error) => {
//         console.log(error)
//     }
// )

const clock = new THREE.Clock()


const animations = {
    default: function () {
        setAction(animationActions[0])
    },
    alternate: function () {
        setAction(animationActions[1])
    },
    // swapCharacter: function (){
    //     scene.add()
    //     scene.remove(originalCharacter)
    //
    //     scene.add(alternateCharacter)
    //     mixer = new THREE.AnimationMixer(alternateCharacter)
    //
    // }
}

const setAction = (toAction: THREE.AnimationAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.play()
    }
}

function animate() {
    requestAnimationFrame(animate)

    if (modelReady) mixer.update(clock.getDelta())


    renderer.render(scene, camera)

    stats.update()
}

animate()
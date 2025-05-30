import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import {Color, Vector3} from "three";

const scene = new THREE.Scene()
scene.background = new Color( 0x181818 )
scene.add(new THREE.AxesHelper(5))
const light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(0.8, 1.4, 1.0)
scene.add(light)
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
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


const start = 0.2;
const spacing = 0.50;
const scale = 0.5;
const material = new THREE.MeshBasicMaterial({color: 0x00aa00, wireframe: true})
const geometry = new THREE.PlaneGeometry(scale, scale, 5, 5)
geometry.rotateX(Math.PI / 2)
geometry.translate(start, 0, 0)
scene.add(new THREE.Mesh(geometry, material))
const material2 = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
const geometry2 = new THREE.PlaneGeometry(scale, scale, 5, 5)
geometry2.rotateX(Math.PI / 2)
geometry2.translate(start + spacing * 1.0, 0, 0)
scene.add(new THREE.Mesh(geometry2, material2))
const material3 = new THREE.MeshBasicMaterial({color: 0x0055ff, wireframe: true})
const geometry3 = new THREE.PlaneGeometry(scale, scale, 5, 5)
geometry3.rotateX(Math.PI / 2)
geometry3.translate(start + spacing * 2.0, 0, 0)
scene.add(new THREE.Mesh(geometry3, material3))
const material4 = new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: true})
const geometry4 = new THREE.PlaneGeometry(scale, scale, 5, 5)
geometry4.rotateX(Math.PI / 2)
geometry4.translate(start + spacing * 3.0, 0, 0)
scene.add(new THREE.Mesh(geometry4, material4))

const arrow1 = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0).normalize(),
    new THREE.Vector3(start + spacing * 0 ,0,0),
    0, 0x00aa00 )
scene.add(arrow1)
const arrow2 = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0).normalize(),
    new THREE.Vector3(start + spacing * 1 ,0,0),
    1, 0xff0000 )
scene.add(arrow2)
const arrow3 = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0).normalize(),
    new THREE.Vector3(start + spacing * 2 ,0,0),
    1, 0x0055ff )
scene.add(arrow3)
const arrow4 = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0).normalize(),
    new THREE.Vector3(start + spacing * 3 ,0,0),
    1, 0xff00ff )
scene.add(arrow4)


const circle1Material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2})
const circle1 = new THREE.Mesh(new THREE.CircleGeometry(0.1), circle1Material)
circle1.rotateX(-Math.PI / 2)
circle1.translateX(start + spacing*0)
scene.add(circle1)
const circle2Material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2})
const circle2 = new THREE.Mesh(new THREE.CircleGeometry(0.1), circle2Material)
circle2.rotateX(-Math.PI / 2)
circle2.translateX(start + spacing*1)
scene.add(circle2)
const circle3Material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2})
const circle3 = new THREE.Mesh(new THREE.CircleGeometry(0.1), circle3Material)
circle3.rotateX(-Math.PI / 2)
circle3.translateX(start + spacing*2)
scene.add(circle3)
const circle4Material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2})
const circle4 = new THREE.Mesh(new THREE.CircleGeometry(0.1), circle4Material)
circle4.rotateX(-Math.PI / 2)
circle4.translateX(start + spacing*3)
scene.add(circle4)


const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 20)

const playbackFolder = gui.addFolder('Playback')

const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

let modelReady = false

const fbxLoader = new FBXLoader()
let mixer: THREE.AnimationMixer
const animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction

fbxLoader.load(
    'f.fbx',
    (object) => {
        object.scale.set(.005, .005, .005)
        mixer = new THREE.AnimationMixer(object)

        // object.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material.transparent = true
        //         child.material.opacity = 0.7
        //         child.material.depthWrite = false // optional: helps avoid z-buffer issues
        //     }
        // })

        scene.add(object)
        const helper = new THREE.SkeletonHelper( object );
        helper.material.transparent = true
        helper.material.opacity = 0.5
        scene.add(helper)
        // modelReady = true

        fbxLoader.load(
            // "Jog In Circle.fbx",
            'binaryMotiveData.fbx',
            (objectInner) => {
                //
                // mixer = new THREE.AnimationMixer(objectInner)
                const animationAction = mixer.clipAction(
                    (objectInner as THREE.Object3D).animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'default')
                activeAction = animationActions[0]
                activeAction.play()
                playbackFolder.add(activeAction, 'timeScale', 0, 1)

                modelReady = true
            }
        )
    },
    (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

let rows: Array<any>
fetch('pressure.csv')
    .then(response => response.text())
    .then(csvText => {
        // Parse CSV text here
        // console.log('Raw CSV:', csvText)
        rows = csvText.split('\n').map(row => row.split(','))
        // console.log('Parsed rows:', rows)
        rows = rows.filter(row => row.length > 1)
    })
    .catch(err => {
        console.error('Error loading CSV:', err)
    })

const clock = new THREE.Clock()

const animations = {
    default: function () {
        setAction(animationActions[0])
    },
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

    if (modelReady) {
        mixer.update(clock.getDelta())
        if (activeAction && rows) {
            const progress = activeAction.time/ activeAction.getClip().duration
            const rowsIndex = Math.round(progress * rows.length)

            const alen1 = rows[rowsIndex][6]
            arrow1.setLength(alen1/1000)
            arrow1.setDirection((new Vector3(rows[rowsIndex][5], rows[rowsIndex][6], rows[rowsIndex][4])).normalize())
            arrow1.position.set(start + spacing * 0 - Number(rows[rowsIndex][6+5])*scale, 0, Number(rows[rowsIndex][6+4])*scale)
            circle1.scale.set(Math.abs(rows[rowsIndex][6+3])/100,Math.abs(rows[rowsIndex][6+3])/100,Math.abs(rows[rowsIndex][6+3])/100)

            const alen2 = rows[rowsIndex][39]
            arrow2.setLength(alen2/1000)
            arrow2.setDirection((new Vector3(rows[rowsIndex][39-1], rows[rowsIndex][39], rows[rowsIndex][39-2])).normalize())
            arrow2.position.set(start + spacing * 1 - Number(rows[rowsIndex][39+5])*scale, 0, Number(rows[rowsIndex][39+4])*scale)
            circle2.scale.set(Math.abs(rows[rowsIndex][39+3])/100,Math.abs(rows[rowsIndex][39+3])/100,Math.abs(rows[rowsIndex][39+3])/100)

            const alen3 = rows[rowsIndex][17]
            arrow3.setLength(alen3/1000)
            arrow3.setDirection((new Vector3(rows[rowsIndex][17-1], rows[rowsIndex][17], rows[rowsIndex][17-2])).normalize())
            arrow3.position.set(start + spacing * 2 - Number(rows[rowsIndex][17+5])*scale, 0, Number(rows[rowsIndex][17+4])*scale)
            circle3.scale.set(Math.abs(rows[rowsIndex][17+3])/100,Math.abs(rows[rowsIndex][17+3])/100,Math.abs(rows[rowsIndex][17+3])/100)

            const alen4 = rows[rowsIndex][28]
            arrow4.setLength(alen4/1000)
            arrow4.setDirection((new Vector3(rows[rowsIndex][28-1], rows[rowsIndex][28], rows[rowsIndex][28-2])).normalize())
            arrow4.position.set(start + spacing * 3 - Number(rows[rowsIndex][28+5])*scale, 0, Number(rows[rowsIndex][28+4])*scale)
            circle4.scale.set(Math.abs(rows[rowsIndex][28+3])/100,Math.abs(rows[rowsIndex][28+3])/100,Math.abs(rows[rowsIndex][28+3])/100)

        }
    }


    renderer.render(scene, camera)

    stats.update()
}

animate()
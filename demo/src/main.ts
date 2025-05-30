import './style.css'
import * as THREE from 'three'
import {ArrowHelper, Material, Mesh, Vector3} from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import {GUI} from 'dat.gui'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {setupLighting} from "./lighting.ts";
import {plumMagenta, skyBlue, strawberryRed, teaGreen} from "./colors.ts";
import {addForcePlateGridToScene, type ForcePlateDatum, parseForcePlateData} from "./forcePlates.ts";

const forcePlateStartDistance = 0.2;
const forcePlateSpacing = 0.50;
const forcePlateLength = 0.5;

const scene = new THREE.Scene()

setupLighting(scene)
addForcePlateGridToScene(scene, forcePlateStartDistance, forcePlateSpacing, forcePlateLength);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
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


const forcePlateArrows: Array<ArrowHelper> = [teaGreen, strawberryRed, skyBlue, plumMagenta].map(
    (color, index) =>
        new ArrowHelper(
            new Vector3(0, 1, 0).normalize(),
            new Vector3(forcePlateStartDistance + forcePlateSpacing * index, 0, 0),
            1, color)
)
forcePlateArrows.forEach((arrow) => scene.add(arrow))

const circleMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.2})
const forcePlateTorqueCircles: Array<Mesh> = Array.from({length: 4}, () =>
    new THREE.Mesh(new THREE.CircleGeometry(0.1), circleMaterial)
)
forcePlateTorqueCircles.forEach((circle, index) => {
    circle.rotateX(-Math.PI / 2)
    circle.translateX(forcePlateStartDistance + forcePlateSpacing * index)
    scene.add(circle)
})


const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const playbackFolder = gui.addFolder('Playback')

let modelReady = false

const fbxLoader = new FBXLoader()
let mixer: THREE.AnimationMixer
let activeAction: THREE.AnimationAction

fbxLoader.load(
    'f.fbx',
    (object) => {
        object.scale.set(.005, .005, .005)
        mixer = new THREE.AnimationMixer(object)

        scene.add(object)
        const helper = new THREE.SkeletonHelper(object);
        (helper.material as Material).transparent = true;
        (helper.material as Material).opacity = 0.5;
        scene.add(helper)

        fbxLoader.load(
            // "Jog In Circle.fbx",
            'binaryMotiveData.fbx',
            (objectInner) => {
                activeAction = mixer.clipAction(
                    (objectInner as THREE.Object3D).animations[0]
                )
                activeAction.play()
                playbackFolder.add(activeAction, 'timeScale', 0, 1)

                modelReady = true
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

let forcePlateData: Array<Array<ForcePlateDatum>>
fetch('pressure.csv')
    .then(response => response.text())
    .then(csvText => {
        forcePlateData = parseForcePlateData(csvText)
    })
    .catch(err => {
        console.error('Error loading CSV:', err)
    })


const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    if (modelReady) {
        mixer.update(clock.getDelta())
        if (activeAction && forcePlateData) {
            const animationProgress = activeAction.time / activeAction.getClip().duration
            const forcePlateCurrentDataIndex = Math.round(animationProgress * forcePlateData.length)
            const forcePlateDataCurrentRow = forcePlateData[forcePlateCurrentDataIndex]

            forcePlateTorqueCircles.forEach((circle, index) => {
                circle.scale.setScalar(Math.abs(forcePlateDataCurrentRow[index].t) / 100)
            })

            forcePlateArrows.forEach((arrow, index) => {
                arrow.setLength(forcePlateDataCurrentRow[index].y / 1000)
                arrow.setDirection((new Vector3(forcePlateDataCurrentRow[index].x, forcePlateDataCurrentRow[index].y, forcePlateDataCurrentRow[index].z)).normalize())
                arrow.position.set(
                    forcePlateStartDistance + forcePlateSpacing * index - Number(forcePlateDataCurrentRow[index].py) * forcePlateLength,
                    0,
                    Number(forcePlateDataCurrentRow[index].px) * forcePlateLength
                )
            })

        }
    }

    renderer.render(scene, camera)

    stats.update()
}

animate()
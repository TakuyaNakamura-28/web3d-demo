import {Canvas, useFrame, useLoader, useThree} from '@react-three/fiber'
import {ashGray, slateGray} from "./colors.ts";
import {OrbitControls, Stats} from '@react-three/drei'
import "./App.css"
import "./slideSwitch.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type RefObject, useEffect, useRef, useState} from "react";
import {
    AnimationAction,
    AnimationMixer,
    ArrowHelper,
    EquirectangularReflectionMapping,
    KeyframeTrack,
    SkeletonHelper
} from "three";
import {ForcePlateOverlay} from "./ForcePlateOverlay.tsx";
import {type ForcePlateDatum, parseForcePlateData} from "./forcePlateData.tsx";
import {GraphWithVelocity} from "./GraphWithVelocity.tsx";
import {ForcePlateArrows} from "./ForcePlateArrows.tsx";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import hdrFile from './skybox/paul_lobe_haus_2k.hdr';

const forcePlateStartDistance = 0.2;
const forcePlateSpacing = 0.5;
const forcePlateLength = 0.5;
const forcePlateVectorDisplayScale = 1 / 1000

function CharacterWithAnimation({mixerRef, character}: {
    mixerRef: RefObject<AnimationMixer | undefined>,
    character: object
}) {
    useFrame((_, delta) => {
        mixerRef.current?.update(delta)
    })

    return <primitive object={character} scale={[0.005, 0.005, 0.005]}/>
}

function Skybox({texture}: {texture: any}) {
    const { scene } = useThree()

    useEffect(() => {
        texture.mapping = EquirectangularReflectionMapping
        scene.environment = texture
        scene.background = texture
    }, [texture, scene])

    return null
}

function App() {
    const arrowRefs = useRef<ArrowHelper[]>([])

    const [forcePlateData, setForcePlateData] = useState<Array<Array<ForcePlateDatum>>>([])
    useEffect(() => {
        fetch('pressure.csv')
            .then(response => response.text())
            .then(csvText => {
                setForcePlateData(parseForcePlateData(csvText))
            })
            .catch(err => {
                console.error('Error loading CSV:', err)
            })
    }, []);

    const texture = useLoader(RGBELoader, hdrFile)

    const character = useLoader(FBXLoader, 'f2.fbx')
    const trackData = useLoader(FBXLoader, 'binaryMotiveData.fbx')
    const [skeleton, setSkeleton] = useState<SkeletonHelper | null>(null)
    const [skeletonEnabled, setSkeletonEnabled] = useState<boolean>(false)
    const [showAngularVelocity, setShowAngularVelocity] = useState<boolean>(false)

    const mixerRef = useRef<AnimationMixer>(undefined)
    const activeAction = useRef<AnimationAction>(undefined)

    const animationProgressRef = useRef(0.0)

    const [rawData, setRawData] = useState<KeyframeTrack[]>([])
    const [graphData, setGraphData] = useState<Array<{ x: number, y: number, z: number, w?: number }>>([])
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("100")
    const [autoRotate, setAutoRotate] = useState<boolean>(false)

    useEffect(() => {
        if (character && trackData.animations.length > 0) {
            mixerRef.current = new AnimationMixer(character)
            const clip = trackData.animations[0]
            const action = mixerRef.current.clipAction(clip)
            activeAction.current = action
            action.play()

            setRawData(clip.tracks)

            const skeletonHelper = new SkeletonHelper(character)
            setSkeleton(skeletonHelper)
        }
    }, [character, trackData])

    return (
        <div id="canvas-container">
            <div className={"canvas"}>
                <Canvas camera={{fov: 75, near: 0.01, far: 1000}}>
                    {/*<Skybox texture={texture}/>*/}

                    <ForcePlateArrows arrowRefs={arrowRefs} forcePlateData={forcePlateData}
                                      activeAction={activeAction.current} animationProgressRef={animationProgressRef}
                                      start={forcePlateStartDistance}
                                      spacing={forcePlateSpacing}
                                      scale={forcePlateLength}
                                      vectorScale={forcePlateVectorDisplayScale}
                    />

                    <axesHelper/>
                    <color attach="background" args={[slateGray]}/>
                    <OrbitControls autoRotate={autoRotate} autoRotateSpeed={10.0}/>

                    <ambientLight intensity={1} color={0xffffff}/>
                    <directionalLight
                        color={0xffffff}
                        intensity={0.8}
                        position={[0.8, 1.4, 1.0]}
                    />

                    <CharacterWithAnimation mixerRef={mixerRef} character={character}/>

                    <ForcePlateOverlay
                        start={forcePlateStartDistance}
                        spacing={forcePlateSpacing}
                        scale={forcePlateLength}
                    />

                    <gridHelper
                        args={[100, 200, 0x000000, 0x000000]}
                        position={[0, -0.01, 0]}
                    />

                    {skeletonEnabled && skeleton && <primitive object={skeleton}/>}

                    <Stats showPanel={0}/>

                </Canvas>
            </div>
            <div className={"analysisUI"}>
                <h2>トヨ推 分析 情報 Frontier</h2>

                <div className="chartContainer">
                    <Canvas
                        orthographic
                        camera={{
                            zoom: 1,
                            left: -0.1, right: 1,
                            top: 1.1, bottom: -1.1,
                            near: -1000, far: 1000,
                            position: [0, 0, 10],
                        }}
                    >
                        <GraphWithVelocity data={graphData} progress={animationProgressRef}
                                           duration={activeAction.current?.getClip().duration}
                                           showAngularVelocity={showAngularVelocity}
                        />
                    </Canvas>
                </div>
                <div className={"buttonList"}>
                    {rawData.map((track) => (
                        <button key={track.name} onClick={() => {
                            const groupedData = []
                            for (let i = 0; i < track.values.length; i += (track.name.includes("quaternion") ? 4 : 3)) {
                                if (track.name.includes("quaternion")) {
                                    groupedData.push({
                                        index: i / 4,
                                        x: track.values[i],
                                        y: track.values[i + 1],
                                        z: track.values[i + 2],
                                        w: track.values[i + 3],
                                    })
                                } else {
                                    groupedData.push({
                                        index: i / 3,
                                        x: track.values[i],
                                        y: track.values[i + 1],
                                        z: track.values[i + 2],
                                    })
                                }
                            }
                            setGraphData(groupedData);
                        }}
                        >{track.name}</button>
                    ))}
                    <button onClick={() => {
                        setGraphData([])
                    }}>無し
                    </button>
                </div>
                <div>
                    <input
                        type="range" min="-1.0" max="1.0" step="0.01" defaultValue="1.0"
                        onChange={(e) => {
                            if (activeAction.current) {
                                activeAction.current.timeScale = Number(e.target.value)
                            }
                            setPlaybackSpeed(Math.round(Number(e.target.value) * 100) + "%")
                        }}
                    />
                </div>
                <div>
                    現在再生速度：<strong className={"displayValue"}>{playbackSpeed}</strong>
                </div>
                <p>
                    <label>
                        自動回転
                        <input
                            type="checkbox"
                            className="slideSwitchInput"
                            onChange={(e) =>
                                setAutoRotate(e.target.checked)
                            }
                        />
                    </label>
                    <br/>
                    <label>
                        スケルトンを表示
                        <input
                            type="checkbox"
                            className="slideSwitchInput"
                            onChange={(e) =>
                                setSkeletonEnabled(e.target.checked)
                            }
                        />
                    </label>
                    <br/>
                    <label>
                        角速度を表示
                        <input
                            type="checkbox"
                            className="slideSwitchInput"
                            onChange={(e) =>
                                setShowAngularVelocity(e.target.checked)
                            }
                        />
                    </label>
                </p>
            </div>
        </div>
    )
}

export default App;

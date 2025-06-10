import {Canvas, useFrame, useLoader, useThree} from '@react-three/fiber'
import {ashGray, forcePlateColors, plumMagenta, skyBlue, slateGray, strawberryRed, teaGreen} from "./colors.ts";
import {Stats, OrbitControls} from '@react-three/drei'
import "./App.css"
import "./slideSwitch.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type RefObject, useEffect, useMemo, useRef, useState} from "react";
import {
    AnimationAction,
    AnimationMixer,
    ArrowHelper,
    KeyframeTrack,
    SkeletonHelper, Vector2,
    Vector3
} from "three";
import {ForcePlateGrid} from "./forcePlateOverlay.tsx";
import {type ForcePlateDatum, parseForcePlateData} from "./forcePlateData.tsx";

const forcePlateStartDistance = 0.2;
const forcePlateSpacing = 0.50;
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


function ForcePlateArrows({arrowRefs, forcePlateData, activeAction, animationProgressRef}: {
    arrowRefs: RefObject<ArrowHelper[]>,
    forcePlateData: Array<Array<ForcePlateDatum>>,
    activeAction?: AnimationAction,
    animationProgressRef: RefObject<number>
}) {
    useFrame(() => {
        if (forcePlateData.length === 0 || !activeAction) return

        const animationProgress = activeAction.time / activeAction.getClip().duration
        const forcePlateCurrentDataIndex = Math.round(animationProgress * forcePlateData.length)
        const forcePlateDataCurrentRow = forcePlateData[forcePlateCurrentDataIndex]

        if (!forcePlateDataCurrentRow) return

        arrowRefs.current?.forEach((arrow, index) => {
            arrow.setLength(forcePlateDataCurrentRow[index].y * forcePlateVectorDisplayScale)
            arrow.setDirection((new Vector3(forcePlateDataCurrentRow[index].x, forcePlateDataCurrentRow[index].y, forcePlateDataCurrentRow[index].z)).normalize())
            arrow.position.set(
                forcePlateStartDistance + forcePlateSpacing * index - Number(forcePlateDataCurrentRow[index].py) * forcePlateLength,
                0,
                Number(forcePlateDataCurrentRow[index].px) * forcePlateLength
            )
        })

        animationProgressRef.current = activeAction.time / activeAction.getClip().duration
    })

    return (
        <>
            {forcePlateColors.map((color, index) => {
                const dir = new Vector3(0, 1, 0).normalize() // default direction
                const origin = new Vector3(index, 0, 0) // space them out
                const length = 1.0

                const arrow = new ArrowHelper(dir, origin, length, color)
                arrowRefs.current[index] = arrow

                return <primitive key={index} object={arrow}/>
            })}
        </>
    )
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


    const character = useLoader(FBXLoader, 'f2.fbx')
    const trackData = useLoader(FBXLoader, 'binaryMotiveData.fbx')
    const [skeleton, setSkeleton] = useState<SkeletonHelper | null>(null)
    const [skeletonEnabled, setSkeletonEnabled] = useState<boolean>(false)

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
            <Canvas camera={{fov: 75, near: 0.01, far: 1000}}>

                <ForcePlateArrows arrowRefs={arrowRefs} forcePlateData={forcePlateData}
                                  activeAction={activeAction.current} animationProgressRef={animationProgressRef}/>

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

                <ForcePlateGrid
                    start={forcePlateStartDistance}
                    spacing={forcePlateSpacing}
                    scale={forcePlateLength}
                />

                {skeletonEnabled && skeletonEnabled && <primitive object={skeleton}/>}

                <Stats/>


            </Canvas>
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
                        <ThreeGraph data={graphData} progress={animationProgressRef}/>
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
                        type="range" min="0" max="1.0" step="0.01" defaultValue="1.0"
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
                </p>
            </div>
        </div>
    )
}

export default App;

import {MeshLineMaterial, MeshLineGeometry} from 'meshline'
import {Text} from '@react-three/drei'

function ThreeGraph({data, progress}: {
    data: { x: number, y: number, z: number, w?: number }[],
    progress: RefObject<number>
}) {
    const {camera, gl} = useThree()
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault()
        }

        gl.domElement.addEventListener('wheel', handleWheel)
        return () => gl.domElement.removeEventListener('wheel', handleWheel)
    }, [camera, gl])

    const scale = useMemo(() =>
            data.length > 0 &&
            Math.max(...data.map(datum => Math.max(Math.abs(datum.x), Math.abs(datum.y), Math.abs(datum.z), 1)))
        , [data])

    const line = useMemo(() => {
        if (data.length == 0) {
            return []
        }
        // const scale = Math.max(...data.map(datum => Math.max(Math.abs(datum.x), Math.abs(datum.y), Math.abs(datum.z), 1)))
        const meshLineX = new MeshLineGeometry()
        meshLineX.setPoints(data.map((d, i) => new Vector3(i / data.length, d.x / scale, 0)))
        const meshLineY = new MeshLineGeometry()
        meshLineY.setPoints(data.map((d, i) => new Vector3(i / data.length, d.y / scale, 0)))
        const meshLineZ = new MeshLineGeometry()
        meshLineZ.setPoints(data.map((d, i) => new Vector3(i / data.length, d.z / scale, 0)))
        if (data[0].w !== undefined) {
            const meshLineW = new MeshLineGeometry()
            meshLineW.setPoints(data.map((d, i) => new Vector3(i / data.length, d.w / scale, 0)))
            return [meshLineX, meshLineY, meshLineZ, meshLineW]
        }
        return [meshLineX, meshLineY, meshLineZ]
    }, [data])

    const progressLine = useMemo(() => {
        const line = new MeshLineGeometry()
        line.setPoints([new Vector3(progress.current, -1, 0), new Vector3(progress.current, 1, 0)])
        return line
    }, [progress])


    useFrame(() => {
        progressLine.setPoints([new Vector3(progress.current, -1, 0), new Vector3(progress.current, 1, 0)])
    })

    if (data.length == 0) {
        return null
    }

    const lineColors = [strawberryRed, teaGreen, skyBlue, plumMagenta]

    return (<>
        <gridHelper args={[2, 20, ashGray, "#666666"]}   position={[1, 0, 0]}
                    rotation={[Math.PI / 2, 0, 0]}/>

        {line.map((oneline, i) => (
            <mesh>
                <primitive attach="geometry" object={oneline}/>
                <primitive
                    attach="material"
                    object={
                        new MeshLineMaterial({
                            color: lineColors[i],
                            lineWidth: 0.01,
                            opacity: 1,
                            resolution: new Vector2(10, 10)
                        })
                    }
                />
            </mesh>
        ))}
        <mesh>
            <primitive attach="geometry" object={progressLine}/>
            <primitive
                attach="material"
                object={
                    new MeshLineMaterial({
                        color: ashGray,
                        lineWidth: 0.01,
                        opacity: 1,
                        resolution: new Vector2(10, 10),
                        dashArray: 0.01,
                        dashRatio: 0.3,
                    })
                }
            />
        </mesh>
        {scale && (<>
            <Text
                position={[-0.01, 1, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5,1,1)}
            >
                {scale.toFixed(2)}
            </Text>
            <Text
                position={[-0.01, 0, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5,1,1)}
            >
                {(0).toFixed(2)}
            </Text>
            <Text
                position={[-0.01, -1, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5,1,1)}
            >
                {(-scale).toFixed(2)}
            </Text>
        </>)}
    </>)
}

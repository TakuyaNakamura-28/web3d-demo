import {Canvas, useFrame, useLoader} from '@react-three/fiber'
import {forcePlateColors, slateGray} from "./colors.ts";
import {Stats, OrbitControls} from '@react-three/drei'
import "./App.css"
import "./slideSwitch.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type RefObject, useEffect, useMemo, useRef, useState} from "react";
import {
    AnimationAction,
    AnimationMixer,
    ArrowHelper,
    BufferGeometry,
    KeyframeTrack,
    SkeletonHelper,
    Vector3
} from "three";
import {ForcePlateGrid} from "./forcePlateOverlay.tsx";
import {LineChart, Line, YAxis, Brush, ResponsiveContainer, ReferenceLine, Tooltip, XAxis} from 'recharts';
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
    const [playbackIndex, setPlaybackIndex] = useState<number>(0)

    const [rawData, setRawData] = useState<KeyframeTrack[]>([])
    const [graphData, setGraphData] = useState<Array<any>>([])
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
            // skeletonHelper.material.linewidth = 2
            // skeletonHelper.material.transparent = true
            // skeletonHelper.material.opacity = 0.7
            setSkeleton(skeletonHelper)
        }
    }, [character, trackData])

    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeAction.current || graphData.length === 0) return

            const progress = activeAction.current.time / activeAction.current.getClip().duration
            const newIndex = Math.floor(progress * graphData.length)
            setPlaybackIndex(newIndex)
        }, 333)

        return () => clearInterval(interval)
    }, [graphData])

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
                    {/*<Canvas*/}
                    {/*    orthographic*/}
                    {/*    camera={{*/}
                    {/*        zoom: 1,           // zoom level (higher = zoom in)*/}
                    {/*        left: 0,*/}
                    {/*        right: 1,*/}
                    {/*        top: 1,*/}
                    {/*        bottom: 0,*/}
                    {/*        near: -1000,*/}
                    {/*        far: 1000,*/}
                    {/*        position: [0, 0, 10], // look from Z axis*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <OrbitControls/>*/}
                    {/*    <ThreeGraph data={graphData} />*/}
                    {/*</Canvas>*/}
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graphData}>
                            <Line type="monotone" dataKey="x" stroke="#ff0000" dot={false}/>
                            <Line type="monotone" dataKey="y" stroke="#00ff00" dot={false}/>
                            <Line type="monotone" dataKey="z" stroke="#0000ff" dot={false}/>
                            <Line type="monotone" dataKey="w" stroke="#000000" dot={false}/>
                            <YAxis domain={['auto', 'auto']}/>
                            <XAxis dataKey="index"/>

                            <Brush dataKey="index" height={30} stroke="#088"/>
                            <ReferenceLine
                                x={Math.round(animationProgressRef.current * graphData.length)}
                                stroke="black"
                                strokeDasharray="3 3"
                            />
                            <Tooltip/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className={"buttonList"}>
                    {rawData.map((track) => (
                        <button onClick={() => {
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
                </div>
                <p>現在データ索引番号：<strong className={"displayValue"}>{playbackIndex}</strong></p>
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

function ThreeGraph({data}: { data: { y: number }[] }) {
    const points = useMemo(() => {
        return data.map((d, i) => new Vector3(i * 0.0001, d.y, 0))
    }, [data])

    const geometry = useMemo(() => new BufferGeometry().setFromPoints(points), [points])

    return (
        <line>
            <primitive object={geometry} attach="geometry"/>
            <lineBasicMaterial attach="material" color="red" />
        </line>
    )
}

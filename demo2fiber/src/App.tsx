import {Canvas, useFrame, useLoader} from '@react-three/fiber'
import {forcePlateColors, slateGray} from "./colors.ts";
import {Stats, OrbitControls} from '@react-three/drei'
import "./App.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type RefObject, useEffect, useRef, useState} from "react";
import {AnimationAction, AnimationMixer, ArrowHelper, KeyframeTrack, Vector3} from "three";
import {type ForcePlateDatum, ForcePlateGrid, parseForcePlateData} from "./forcePlates.tsx";
import {LineChart, Line, YAxis, Brush} from 'recharts';

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


function ForcePlateArrows({arrowRefs, forcePlateData, activeAction}: {
    arrowRefs: RefObject<ArrowHelper[]>,
    forcePlateData: Array<Array<ForcePlateDatum>>,
    activeAction?: AnimationAction
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

    const mixerRef = useRef<AnimationMixer>(undefined)
    const activeAction = useRef<AnimationAction>(undefined)

    const [rawData, setRawData] = useState<KeyframeTrack[]>([])
    const [graphData, setGraphData] = useState<Array<any>>([])

    useEffect(() => {
        if (character && trackData.animations.length > 0) {
            mixerRef.current = new AnimationMixer(character)
            const clip = trackData.animations[0]
            const action = mixerRef.current.clipAction(clip)
            activeAction.current = action
            action.play()

            setRawData(clip.tracks)
        }
    }, [character, trackData])


    return (
        <div id="canvas-container">
            <Canvas camera={{fov: 75, near: 0.01, far: 1000}}>

                <ForcePlateArrows arrowRefs={arrowRefs} forcePlateData={forcePlateData}
                                  activeAction={activeAction.current}/>

                <axesHelper/>
                <color attach="background" args={[slateGray]}/>
                <OrbitControls/>

                <ambientLight intensity={1} color={0xffffff}/>
                <directionalLight
                    color={0xffffff}
                    intensity={0.5}
                    position={[0.8, 1.4, 1.0]}
                />

                <CharacterWithAnimation mixerRef={mixerRef} character={character}/>

                <ForcePlateGrid
                    start={forcePlateStartDistance}
                    spacing={forcePlateSpacing}
                    scale={forcePlateLength}
                />

                <Stats/>

            </Canvas>
            <div className={"analysisUI"}>
                <h1>トヨ推 分析 情報 Frontier</h1>

                <div style={{backgroundColor: '#f0f0f0', padding: 10}}>
                    <LineChart width={400} height={400} data={
                        graphData
                    }>
                        <Line type="monotone" dataKey="x" stroke="#ff0000" dot={false}/>
                        <Line type="monotone" dataKey="y" stroke="#00ff00" dot={false}/>
                        <Line type="monotone" dataKey="z" stroke="#0000ff" dot={false}/>
                        <Line type="monotone" dataKey="w" stroke="#000000" dot={false}/>
                        <YAxis domain={['auto', 'auto']}/>

                        <Brush dataKey="index" height={30} stroke="#8884d8"/>

                    </LineChart>
                </div>
                <div style={{height: "400px", overflowY: "scroll", background: "#eee"}}>
                    {rawData.map((track) => (
                        <button onClick={() => {
                            const groupedData = []
                            for (let i = 0; i < track.values.length; i += (track.name.includes("quaternion") ? 4 : 3)) {
                                if (track.name.includes("quaternion")) {
                                    groupedData.push({
                                        x: track.values[i],
                                        y: track.values[i + 1],
                                        z: track.values[i + 2],
                                        w: track.values[i + 3],
                                    })
                                } else {
                                    groupedData.push({
                                        x: track.values[i],
                                        y: track.values[i + 1],
                                        z: track.values[i + 2],
                                        // w: graph[i + 3],
                                    })
                                }
                            }
                            setGraphData(groupedData);
                        }}
                        >{track.name}</button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default App;

import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {OrbitControls, Stats} from '@react-three/drei'
import "./App.css"
import "./slideSwitch.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type ChangeEvent, type RefObject, useEffect, useRef, useState} from "react";
import {
    AnimationAction,
    AnimationMixer,
    ArrowHelper,
    EquirectangularReflectionMapping,
    KeyframeTrack, Object3D,
    SkeletonHelper, Vector3
} from "three";
import {ForcePlateOverlay} from "./ForcePlateOverlay.tsx";
import {type ForcePlateDatum, parseForcePlateData} from "./forcePlateData.tsx";
import {GraphWithVelocity} from "./GraphWithVelocity.tsx";
import {ForcePlateArrows} from "./ForcePlateArrows.tsx";

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

function Skybox({texture}: { texture: any }) {
    const {scene} = useThree()

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

    const [character2, setCharacter2] = useState<Object3D | null>(null)
    const [trackData2, setTrackData2] = useState<Object3D | null>(null)

    const [skeleton, setSkeleton] = useState<SkeletonHelper | null>(null)
    const [skeletonEnabled, setSkeletonEnabled] = useState<boolean>(false)
    const [showAngularVelocity, setShowAngularVelocity] = useState<boolean>(false)
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false)

    const mixerRef = useRef<AnimationMixer>(undefined)
    const activeAction = useRef<AnimationAction>(undefined)

    const animationProgressRef = useRef(0.0)

    const [rawData, setRawData] = useState<KeyframeTrack[]>([])
    const [graphData, setGraphData] = useState<Array<{ x: number, y: number, z: number, w?: number }>>([])
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("100")
    const [autoRotate, setAutoRotate] = useState<boolean>(false)

    useEffect(() => {
        if (character2 && trackData2 && trackData2.animations.length > 0) {
            mixerRef.current = new AnimationMixer(character2)
            const clip = trackData2.animations[0]
            const action = mixerRef.current.clipAction(clip)
            activeAction.current = action
            action.play()

            setRawData(clip.tracks)

            const skeletonHelper = new SkeletonHelper(character2)
            setSkeleton(skeletonHelper)
        }
    }, [character2, trackData2])

    const changePlaybackSpeed = (speed: number) => {
        if (activeAction.current) {
            activeAction.current.timeScale = speed
        }
        setPlaybackSpeed(Math.round(speed * 100) + "%")
    }

    return (
        <div id="canvas-container">
            <div className={"canvas"}>
                <Canvas
                    camera={{fov: 75, near: 0.01, far: 1000, position: [1.5, 1, 2.5],}}
                >
                    {/*<Skybox texture={texture}/>*/}

                    {(forcePlateData.length > 0) && <ForcePlateArrows
                        arrowRefs={arrowRefs}
                        forcePlateData={forcePlateData}
                        activeAction={activeAction.current}
                        animationProgressRef={animationProgressRef}
                        start={forcePlateStartDistance}
                        spacing={forcePlateSpacing}
                        scale={forcePlateLength}
                        vectorScale={forcePlateVectorDisplayScale}
                    />}

                    <axesHelper scale={new Vector3(0.1, 0.1, 0.1)}/>
                    <color attach="background" args={[0x202020]}/>
                    <OrbitControls autoRotate={autoRotate} autoRotateSpeed={4.0}/>

                    <ambientLight intensity={1} color={0xffffff}/>
                    <directionalLight
                        color={0xffffff}
                        intensity={0.8}
                        position={[0.8, 1.4, 1.0]}
                    />

                    {character2 && <CharacterWithAnimation mixerRef={mixerRef} character={character2}/>}

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
                    {Array.from({length: 4}).map((_, forcePlateIndex) => (
                        <>
                            <button onClick={() => {
                                setGraphData(
                                    forcePlateData.map((row, i) =>
                                        ({
                                            index: i,
                                            x: row[forcePlateIndex].x,
                                            y: row[forcePlateIndex].y,
                                            z: row[forcePlateIndex].z,
                                        }))
                                )
                            }}>フォースプレート{forcePlateIndex + 1} 力
                            </button>
                            <button onClick={() => {
                                setGraphData(
                                    forcePlateData.map((row, i) =>
                                        ({index: i, x: row[forcePlateIndex].px, y: row[forcePlateIndex].py, z: 0}))
                                )
                            }}>フォースプレート{forcePlateIndex + 1} 位置
                            </button>
                        </>
                    ))}

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
                        >骨：{track.name}</button>
                    ))}
                    <button onClick={() => {
                        setGraphData([])
                    }}>無し
                    </button>
                </div>
                <div>
                    <input
                        type="range" min="-1.0" max="1.0" step="0.01"
                        value={activeAction.current?.timeScale ?? 1}
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
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="playbackButtons">
                        <button onClick={() => {
                            changePlaybackSpeed(-1)
                        }}>◀</button>
                        <button onClick={() => {
                            changePlaybackSpeed(0)
                        }}>⏸</button>
                        <button onClick={() => {
                            changePlaybackSpeed(+1)
                        }}>▶</button>
                    </span>
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
                    <br/>
                    <button className="bigButton" onClick={() => {
                        setShowUploadModal(true)
                    }}>📂 データファイルを読み込む
                    </button>
                    {<dialog open={showUploadModal}>
                        <h2>📁 データファイルを読み込む</h2>
                        <p>
                            <FallbackFBXLoader
                                url="f2.fbx"
                                label="キャラクターのFBXファイル"
                                onLoad={(obj) => setCharacter2(obj)}
                                onError={() => setShowUploadModal(true)}
                            />
                        </p>
                        <p>
                            <FallbackFBXLoader
                                url="binaryMotiveData.fbx"
                                label="トラックデータのFBXファイル"
                                onLoad={(obj) => setTrackData2(obj)}
                                onError={() => setShowUploadModal(true)}
                            />
                        </p>
                        <p>
                            <label><span><strong>フォースプレートのCSVファイル</strong>を読み込めなかった場合はローカルファイルを選択してください。</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const csvText = reader.result as string;
                                            setForcePlateData(parseForcePlateData(csvText))
                                        };
                                        reader.onerror = (err) => {
                                            console.error("Failed to read file:", err);
                                            setShowUploadModal(true);
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                            </label>
                        </p>
                        <div style={{textAlign: "right"}}>
                            <button className="bigButton cancel" onClick={() => setShowUploadModal(false)}>完了</button>
                        </div>
                    </dialog>}
                </p>
            </div>
        </div>
    )
}

export default App;


function FallbackFBXLoader({url, label, onLoad, onError}: {
    url: string,
    label: string,
    onLoad: (object: Object3D) => void
    onError: () => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const loader = new FBXLoader()
        loader.load(
            url,
            (obj) => onLoad(obj),
            undefined,
            () => {
                console.log(`${url} の読み込みが失敗しました。`)
                onError()
            }
        )
    }, [url])

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer
            const loader = new FBXLoader()
            const obj = loader.parse(arrayBuffer, '')
            onLoad(obj)
        }
        reader.readAsArrayBuffer(file)
    }

    return (
        <label><span><strong>{label}</strong>を読み込めなかった場合はローカルファイルを選択してください。</span>
            <input
                ref={fileInputRef}
                type="file"
                accept=".fbx"
                onChange={handleFileUpload}
            />
        </label>
    )
}

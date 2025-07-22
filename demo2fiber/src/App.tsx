import {Canvas, useFrame} from '@react-three/fiber'
import {OrbitControls, Stats} from '@react-three/drei'
import "./App.css"
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {type ChangeEvent, type RefObject, useEffect, useRef, useState} from "react";
import {
    AnimationAction,
    AnimationMixer,
    ArrowHelper,
    KeyframeTrack, Object3D,
    SkeletonHelper, Vector3
} from "three";
import {ForcePlateOverlay} from "./ForcePlateOverlay.tsx";
import {type ForcePlateDatum, parseForcePlateData} from "./forcePlateData.tsx";
import {GraphWithVelocity} from "./GraphWithVelocity.tsx";
import {ForcePlateArrows} from "./ForcePlateArrows.tsx";
import readmeContent from '../readme.md?raw';
import Markdown from "react-markdown";
import YomiKomiChu from "./YomiKomiChu.tsx";
import Navbar from './components/Navbar';
import FourViewports from './components/FourViewports';
import PlaybackControls from './components/PlaybackControls';
import LineChart from './components/LineChart';
import ChatSection from './components/ChatSection';

const forcePlateStartDistance = 0.2;
const forcePlateSpacing = 0.5;
const forcePlateLength = 0.5;
const forcePlateVectorDisplayScale = 1 / 1000


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
    const [readmePopupIsOpen, setReadmePopupIsOpen] = useState<boolean>(false)

    const mixerRef = useRef<AnimationMixer>(undefined)
    const activeAction = useRef<AnimationAction>(undefined)

    const animationProgressRef = useRef(0.0)

    const [rawData, setRawData] = useState<KeyframeTrack[]>([])
    const [graphData, setGraphData] = useState<Array<{ x: number, y: number, z: number, w?: number }>>([])
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("100")
    const [autoRotate, setAutoRotate] = useState<boolean>(false)
    const [loadingCount, setLoadingCount] = useState<number>(0)
    const [isPlaying, setIsPlaying] = useState<boolean>(true)
    const [chartData, setChartData] = useState<Array<any>>([]);

    useEffect(() => {
        if (character2 && trackData2 && trackData2.animations.length > 0) {
            mixerRef.current = new AnimationMixer(character2)
            const clip = trackData2.animations[0].clone()
            
            // Map track names to match character bone names
            const characterBones = new Set<string>()
            character2.traverse((child) => {
                if (child.type === 'Bone') {
                    characterBones.add(child.name)
                }
            })
            
            // Find the target prefix (e.g., "SubMg_") from character bones
            const characterPrefix = Array.from(characterBones).find(name => name.includes('_'))?.split('_')[0] + '_'
            
            if (characterPrefix) {
                clip.tracks.forEach(track => {
                    // Extract the track prefix and bone name
                    const trackNameParts = track.name.match(/^(.+?)_(.+)\.(.+)$/)
                    if (trackNameParts) {
                        const [, trackPrefix, boneName, property] = trackNameParts
                        if (trackPrefix + '_' !== characterPrefix) {
                            // Rename the track to match character prefix
                            track.name = `${characterPrefix}${boneName}.${property}`
                        }
                    }
                })
            }
            
            const action = mixerRef.current.clipAction(clip)
            activeAction.current = action
            action.play()

            setRawData(clip.tracks)
            
            // Initialize chart data
            const mockChartData = [
                { name: 'Jan', item1: 180, item2: 100 },
                { name: 'Feb', item1: 200, item2: 120 },
                { name: 'Mar', item1: 150, item2: 180 },
                { name: 'Apr', item1: 280, item2: 200 },
                { name: 'May', item1: 250, item2: 150 },
                { name: 'Jun', item1: 240, item2: 160 },
            ];
            setChartData(mockChartData);

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
    
    const handlePlayPause = () => {
        if (activeAction.current) {
            if (isPlaying) {
                activeAction.current.paused = true;
            } else {
                activeAction.current.paused = false;
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleProgressChange = (progress: number) => {
        if (activeAction.current) {
            const duration = activeAction.current.getClip().duration;
            activeAction.current.time = progress * duration;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[1280px] h-full flex gap-2">
                    {/* Left Column - Viewports and Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                        {/* 4 Viewports */}
                        {character2 ? (
                            <FourViewports
                                character={character2}
                                mixerRef={mixerRef}
                                skeleton={skeleton}
                                skeletonEnabled={skeletonEnabled}
                            />
                        ) : (
                            <div className="h-[486px] w-full bg-neutral-100 rounded-lg flex items-center justify-center">
                                <span className="text-neutral-500">3Dモデルを読み込み中...</span>
                            </div>
                        )}
                        
                        {/* Playback Controls */}
                        {activeAction.current && (
                            <PlaybackControls
                                progress={animationProgressRef.current}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                onProgressChange={handleProgressChange}
                            />
                        )}
                        
                        {/* Line Chart */}
                        <div className="h-[246px]">
                            <LineChart
                                data={chartData}
                                lines={[
                                    { dataKey: 'item1', name: 'Item 1', color: '#ea580c' },
                                    { dataKey: 'item2', name: 'Item 2', color: '#0d9488' }
                                ]}
                                showLegend={true}
                                showGrid={true}
                            />
                        </div>
                    </div>
                    
                    {/* Right Column - Chat Section */}
                    <div className="w-60 h-full">
                        <ChatSection />
                    </div>
                </div>
            </div>
            {showUploadModal && <dialog open={true}>
                <h2>📁 データファイルを読み込む</h2>
                <p>
                    <FallbackFBXLoader
                        url="f2.fbx"
                        label="キャラクターのFBXファイル"
                        onLoad={(obj) => {
                            setCharacter2(obj)
                            setShowUploadModal(false)
                        }}
                        onError={() => {
                            setShowUploadModal(true)
                        }}
                    />
                </p>
                <p>
                    <FallbackFBXLoader
                        url="binaryMotiveData.fbx"
                        label="トラックデータのFBXファイル"
                        onLoad={(obj) => {
                            setTrackData2(obj)
                            setShowUploadModal(false)
                        }}
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
            <MarkdownPopup isOpen={readmePopupIsOpen} onClose={() => {
                setReadmePopupIsOpen(false)
            }} markdownContent={
                readmeContent
            }/>
            
            {/* Hidden Canvas for Force Plate Data */}
            {(forcePlateData.length > 0) && (
                <div className="hidden">
                    <Canvas>
                        <ForcePlateArrows
                            arrowRefs={arrowRefs}
                            forcePlateData={forcePlateData}
                            activeAction={activeAction.current}
                            animationProgressRef={animationProgressRef}
                            start={forcePlateStartDistance}
                            spacing={forcePlateSpacing}
                            scale={forcePlateLength}
                            vectorScale={forcePlateVectorDisplayScale}
                        />
                        <ForcePlateOverlay
                            start={forcePlateStartDistance}
                            spacing={forcePlateSpacing}
                            scale={forcePlateLength}
                        />
                    </Canvas>
                </div>
            )}
            
            {loadingCount > 0 && <YomiKomiChu/>}
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


function MarkdownPopup({isOpen, onClose, markdownContent}: {
    isOpen: boolean,
    onClose: () => void,
    markdownContent: string
}) {
    return (
        <dialog open={isOpen} className="markdownPopup">
            <div style={{lineHeight: 1.5}}>
                <button
                    onClick={onClose}
                    style={{float: "right", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer"}}
                >
                    ✖
                </button>
                <h2>📄 README</h2>
                <hr/>
                <Markdown>
                    {markdownContent}
                </Markdown>
            </div>
        </dialog>
    );
}


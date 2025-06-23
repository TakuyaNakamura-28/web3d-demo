import {type RefObject, useEffect, useRef, useState} from "react";
import {MeshLineGeometry, MeshLineMaterial} from "meshline";
import {extend, useFrame, useThree} from '@react-three/fiber'
import {Vector2, Vector3} from "three";
import {ashGray} from "./colors.ts";
import {Text} from "@react-three/drei";
// @ts-ignore
import {MaterialNode, Object3DNode} from "three/src/nodes/Nodes";

extend({MeshLineGeometry, MeshLineMaterial})

declare module '@react-three/fiber' {
    interface ThreeElements {
        meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
        meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
    }
}

export default function FrontierGraph({data, progress, colors, dataKeys}: {
    data: any[],
    progress: RefObject<number>,
    colors: number[],
    dataKeys: string[]
}) {
    const [graphScale, setGraphScale] = useState<number>(1.0)
    const zoomLevelRef = useRef(1)
    const progressLineGeometryRef = useRef<any>(null)
    const dataLineRef = useRef<any[]>([])

    const {gl, viewport} = useThree();

    useEffect(() => {
        const canvas = gl.domElement;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            zoomLevelRef.current = Math.min(Math.max(zoomLevelRef.current + e.deltaY * 0.01, 1), 20);
        };

        canvas.addEventListener("wheel", handleWheel, {passive: false});
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [gl.domElement]);

    useEffect(() => {
        if (data.length > 0) {
            setGraphScale(
                Math.max(...data.map(datum =>
                        Math.max(...dataKeys.map(key => Math.abs(datum[key])))
                    , 1))
            )
        }
    }, [data, dataKeys]);


    useFrame(() => {
        const zoom = zoomLevelRef.current
        if (progressLineGeometryRef.current) {
            if (progress.current > 1 / zoom / 2 && progress.current < (1 - 1 / zoom / 2)) {
                progressLineGeometryRef.current.setPoints([new Vector3(0.5, -1, 0), new Vector3(0.5, 1, 0)])
            } else if (progress.current < 0.5) {
                progressLineGeometryRef.current.setPoints([new Vector3(progress.current * zoom, -1, 0), new Vector3(progress.current * zoom, 1, 0)])
            } else if (progress.current > 0.5) {
                progressLineGeometryRef.current.setPoints([new Vector3(1 + (progress.current - 1) * zoom, -1, 0), new Vector3(1 + (progress.current - 1) * zoom, 1, 0)])
            }
        }

        if (dataLineRef.current) {
            const start = Math.min(
                Math.max(0, Math.round(progress.current * data.length - data.length / zoom / 2)),
                Math.round(data.length - data.length / zoom)
            )
            const end = Math.min(data.length, Math.round(start + data.length / zoom))
            const slicedData = data.slice(start, end)

            dataKeys.forEach((keyName, i) => {
                dataLineRef.current[i].setPoints(
                    slicedData.map((d, i) => new Vector3(i / slicedData.length, (d[keyName] ?? 0) / graphScale, 0))
                )
            })
        }
    })

    return (<>
        <gridHelper args={[2, 20, "#555555", "#505050"]} position={[1, 0, 0]}
                    rotation={[Math.PI / 2, 0, 0]}/>

        {dataKeys.map((keyName, i) => (
            <mesh key={keyName}>
                <meshLineGeometry
                    points={[new Vector3(0, 0, 0), new Vector3(1, 1, 1)]}
                    ref={(el: any) => {
                        dataLineRef.current[i] = el
                    }}
                />
                <meshLineMaterial
                    color={colors[i]}
                    lineWidth={0.005}
                    opacity={0.5}
                    resolution={new Vector2(10, 10)}
                />
            </mesh>
        ))}
        <mesh>
            <meshLineGeometry
                points={[new Vector3(0, 0, 0), new Vector3(1, 1, 1)]}
                ref={progressLineGeometryRef}
            />
            <meshLineMaterial
                color={ashGray}
                lineWidth={0.01}
                opacity={1}
                resolution={new Vector2(10, 10)}
                dashArray={0.01}
                dashRatio={0.3}
            />
        </mesh>
        {graphScale && (<>
            <Text
                position={[-0.01, 1, 0]}
                fontSize={0.07}
                fontWeight={"bold"}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(viewport.height / viewport.width / 2, 1, 1)}
            >
                {graphScale.toFixed(2)}
            </Text>
            <Text
                position={[-0.01, 0, 0]}
                fontSize={0.07}
                fontWeight={"bold"}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(viewport.height / viewport.width / 2, 1, 1)}
            >
                {(0).toFixed(2)}
            </Text>
            <Text
                position={[-0.01, -1, 0]}
                fontSize={0.07}
                fontWeight={"bold"}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(viewport.height / viewport.width / 2, 1, 1)}
            >
                {(-graphScale).toFixed(2)}
            </Text>
        </>)}
    </>)
}
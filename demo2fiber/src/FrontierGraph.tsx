import {type RefObject, useEffect, useMemo, useState} from "react";
import {MeshLineGeometry, MeshLineMaterial} from "meshline";
import { Vector2, Vector3} from "three";
import {useFrame} from "@react-three/fiber";
import {ashGray} from "./colors.ts";
import {Text} from "@react-three/drei";

export default function FrontierGraph({data, progress, colors, dataKeys}: {
    data: any[],
    progress: RefObject<number>,
    colors: number[],
    dataKeys: string[]
}) {
    const [graphScale, setGraphScale] = useState<number>(1.0)

    useEffect(() => {
        if (data.length > 0) {
            setGraphScale(
                Math.max(...data.map(datum =>
                    Math.max(...dataKeys.map(key => Math.abs(datum[key])))
                , 1))
            )
        }
    }, [data, dataKeys]);

    const lines = useMemo(() => {
        if (data.length == 0) {
            return []
        }

        return dataKeys.map(keyName => {
                const meshLine = new MeshLineGeometry()
                meshLine.setPoints(
                    data.map((d, i) => new Vector3(i / data.length, (d[keyName] ?? 0) / graphScale, 0))
                )
                return meshLine
            }
        )
    }, [data, graphScale, dataKeys])

    const progressLine = useMemo(() => {
        const line = new MeshLineGeometry()
        line.setPoints([new Vector3(progress.current, -1, 0), new Vector3(progress.current, 1, 0)])
        return line
    }, [progress])


    useFrame(() => {
        progressLine.setPoints([new Vector3(progress.current, -1, 0), new Vector3(progress.current, 1, 0)])
    })

    return (<>
        <gridHelper args={[2, 20, ashGray, "#666666"]} position={[1, 0, 0]}
                    rotation={[Math.PI / 2, 0, 0]}/>

        {lines.map((oneline, i) => (
            <mesh key={i}>
                <primitive attach="geometry" object={oneline}/>
                <primitive
                    attach="material"
                    object={
                        new MeshLineMaterial({
                            color: colors[i],
                            lineWidth: 0.005,
                            opacity: 0.5,
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
        {graphScale && (<>
            <Text
                position={[-0.01, 1, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5, 1, 1)}
            >
                {graphScale.toFixed(2)}
            </Text>
            <Text
                position={[-0.01, 0, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5, 1, 1)}
            >
                {(0).toFixed(2)}
            </Text>
            <Text
                position={[-0.01, -1, 0]}
                fontSize={0.05}
                color="white"
                anchorX="right"
                anchorY="middle"
                scale={new Vector3(0.5, 1, 1)}
            >
                {(-graphScale).toFixed(2)}
            </Text>
        </>)}
    </>)
}
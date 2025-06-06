import * as THREE from "three";
import {forcePlateColors} from "./colors.ts";
import {useMemo} from "react";

export type ForcePlateDatum = { x: number, y: number, z: number, t: number, px: number, py: number }

export function parseForcePlateData(csvText: string): Array<Array<ForcePlateDatum>> {
    const csvPlateDataOffsets = [4, 37, 15, 26]
    return csvText.split('\n').map(row => row.split(',')).filter(row => row.length > 1).map(row =>
        csvPlateDataOffsets.map((offset) => ({
            z: Number(row[offset]),
            x: Number(row[offset + 1]),
            y: Number(row[offset + 2]),
            t: Number(row[offset + 5]),
            px: Number(row[offset + 6]),
            py: Number(row[offset + 7])
        }))
    )
}


export function ForcePlateGrid({start, spacing, scale}: { start: number, spacing: number, scale: number }) {
    const geometries = useMemo(() => {
        return forcePlateColors.map((color, index) => {
            const geometry = new THREE.PlaneGeometry(scale, scale, 5, 5)
            geometry.rotateX(Math.PI / 2)
            geometry.translate(start + spacing * index, 0, 0)
            return {geometry, color}
        })
    }, [start, spacing, scale])

    return (
        <>
            {geometries.map(({geometry, color}, idx) => (
                <mesh key={idx} geometry={geometry}>
                    <meshBasicMaterial color={color} wireframe={true}/>
                </mesh>
            ))}
        </>
    )
}

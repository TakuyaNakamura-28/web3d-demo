import * as THREE from "three";
import {forcePlateColors} from "./colors.ts";
import {useMemo} from "react";


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

import * as THREE from "three";
import {Scene} from "three";
import {plumMagenta, skyBlue, strawberryRed, teaGreen} from "./colors.ts";

export function addForcePlateGridToScene(scene: Scene, start: number, spacing: number, scale: number) {
    [teaGreen, strawberryRed, skyBlue, plumMagenta].forEach((color, index) => {
        const material = new THREE.MeshBasicMaterial({color, wireframe: true})
        const geometry = new THREE.PlaneGeometry(scale, scale, 5, 5)
        geometry.rotateX(Math.PI / 2)
        geometry.translate(start + spacing * index, 0, 0)
        scene.add(new THREE.Mesh(geometry, material))
    })
}

export type ForcePlateDatum  = { x: number, y: number, z: number, t: number, px: number, py: number }

export function parseForcePlateData (csvText: string) : Array<Array<ForcePlateDatum>> {
    return csvText.split('\n').map(row => row.split(',')).filter(row => row.length > 1).map(row => [
        {
            x: Number(row[6 - 1]),
            y: Number(row[6]),
            z: Number(row[6 - 2]),
            t: Number(row[6 + 3]),
            px: Number(row[6 + 4]),
            py: Number(row[6 + 5])
        },
        {
            x: Number(row[39 - 1]),
            y: Number(row[39]),
            z: Number(row[39 - 2]),
            t: Number(row[39 + 3]),
            px: Number(row[39 + 4]),
            py: Number(row[39 + 5])
        },
        {
            x: Number(row[17 - 1]),
            y: Number(row[17]),
            z: Number(row[17 - 2]),
            t: Number(row[17 + 3]),
            px: Number(row[17 + 4]),
            py: Number(row[17 + 5])
        },
        {
            x: Number(row[28 - 1]),
            y: Number(row[28]),
            z: Number(row[28 - 2]),
            t: Number(row[28 + 3]),
            px: Number(row[28 + 4]),
            py: Number(row[28 + 5])
        },
    ])
}
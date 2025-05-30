import * as THREE from "three";
import {Color, type Scene} from "three";
import {slateGray} from "./colors.ts";

export function setupLighting(scene: Scene) {
    scene.background = new Color(slateGray)
    scene.add(new THREE.AxesHelper(5))
    const light = new THREE.DirectionalLight(0xffffff, 0.5)
    light.position.set(0.8, 1.4, 1.0)
    scene.add(light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)
}
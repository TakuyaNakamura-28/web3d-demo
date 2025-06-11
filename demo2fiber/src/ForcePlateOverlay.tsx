import * as THREE from "three";
import {ashGray, forcePlateColors, strawberryRed} from "./colors.ts";
import {useMemo} from "react";


export function ForcePlateOverlay({start, spacing, scale}: { start: number, spacing: number, scale: number }) {
    return forcePlateColors.map((color, index) => (
        <gridHelper
            args={[scale*0.98, 5, ashGray, color]}
            position={[start + spacing * index, 0, 0]}
        />
    ))
}

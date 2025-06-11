import type {RefObject} from "react";
import {AnimationAction, ArrowHelper, Vector3} from "three";
import type {ForcePlateDatum} from "./forcePlateData.tsx";
import {useFrame} from "@react-three/fiber";
import {forcePlateColors} from "./colors.ts";

export function ForcePlateArrows({
                                     arrowRefs,
                                     forcePlateData,
                                     activeAction,
                                     animationProgressRef,
                                     start,
                                     spacing,
                                     scale,
                                     vectorScale
                                 }: {
    arrowRefs: RefObject<ArrowHelper[]>,
    forcePlateData: Array<Array<ForcePlateDatum>>,
    activeAction?: AnimationAction,
    animationProgressRef: RefObject<number>,
    start: number, spacing: number, scale: number,
    vectorScale: number
}) {
    useFrame(() => {
        if (forcePlateData.length === 0 || !activeAction) return

        const animationProgress = activeAction.time / activeAction.getClip().duration
        const forcePlateCurrentDataIndex = Math.round(animationProgress * forcePlateData.length)
        const forcePlateDataCurrentRow = forcePlateData[forcePlateCurrentDataIndex]

        if (!forcePlateDataCurrentRow) return

        arrowRefs.current?.forEach((arrow, index) => {
            arrow.setLength(forcePlateDataCurrentRow[index].y * vectorScale)
            arrow.setDirection((new Vector3(forcePlateDataCurrentRow[index].x, forcePlateDataCurrentRow[index].y, -forcePlateDataCurrentRow[index].z)).normalize())
            arrow.position.set(
                start + spacing * index - Number(forcePlateDataCurrentRow[index].py) * scale,
                0,
                Number(forcePlateDataCurrentRow[index].px) * scale
            )
        })

        animationProgressRef.current = activeAction.time / activeAction.getClip().duration
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
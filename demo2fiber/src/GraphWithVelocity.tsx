import {type RefObject, useEffect, useState} from "react";
import {Quaternion} from "three";
import FrontierGraph from "./FrontierGraph.tsx";
import {ashGray, plumMagenta, ramuneCyan, skyBlue, strawberryRed, sunYellow, teaGreen} from "./colors.ts";

import {estimateScalarAngularVelocity} from "./estimateScalarAngularVelocity.tsx";

export function GraphWithVelocity({data, progress, duration, showAngularVelocity}: {
    data: { x: number, y: number, z: number, w?: number }[],
    progress: RefObject<number>,
    duration?: number,
    showAngularVelocity: boolean,
}) {
    const [visibleData, setVisibleData] = useState<any[]>([])

    useEffect(() => {
        if (data.length == 0) {
            setVisibleData([])
            return;
        }
        const newVisibleData: any[] = [...data]
        if (showAngularVelocity && data[0].w !== undefined) {
            for (let i = 1; i < data.length; i++) {
                newVisibleData[i] = {
                    ...newVisibleData[i], v: (estimateScalarAngularVelocity(
                        new Quaternion(data[i - 1].x, data[i - 1].y, data[i - 1].z, data[i - 1].w),
                        new Quaternion(data[i].x, data[i].y, data[i].z, data[i].w),
                        (duration ?? 0) / data.length
                    ))
                }
            }
            newVisibleData[0] = {...newVisibleData[0], v: 0};
        }
        setVisibleData(newVisibleData)
    }, [data, showAngularVelocity, duration]);

    if (visibleData.length == 0) {
        return null;
    }

    const keyPriorityOrder = ['x', 'y', 'z', 'w']
    const dataKeys = [
        ...keyPriorityOrder.filter(key => key in visibleData[0]),
        ...Object.keys(visibleData[0])
            .filter(key => key !== 'index' && !keyPriorityOrder.includes(key)),
    ]

    return <FrontierGraph
        data={visibleData}
        progress={progress}
        colors={[strawberryRed, teaGreen, skyBlue, plumMagenta, ashGray, sunYellow, ramuneCyan]}
        dataKeys={dataKeys}
    />
}
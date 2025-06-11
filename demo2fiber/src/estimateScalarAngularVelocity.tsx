import {Quaternion} from "three";

export function estimateScalarAngularVelocity(
    q1: Quaternion,
    q2: Quaternion,
    dt: number
): number {
    const qDelta = q1.clone().invert().multiply(q2).normalize()
    const clampedW = Math.max(-1, Math.min(1, qDelta.w))
    const angle = 2 * Math.acos(clampedW)
    return angle / dt
}

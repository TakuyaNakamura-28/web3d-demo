import {describe, it, expect, beforeEach} from 'vitest'
import {Canvas, useFrame} from "@react-three/fiber";
import ReactThreeTestRenderer from '@react-three/test-renderer'
import {render} from "@testing-library/react";
import FrontierGraph from "./FrontierGraph.tsx";
import {Vector2, Vector3} from "three";
import {teaGreen} from "./colors.ts";
import type {MeshLineGeometry} from "meshline";

describe('FrontierGraph', () => {
    beforeEach(() => {
    })

    it('renders without crashing', () => {
        const progress = {current: 0.5}

        const TestWrapper = () => (
            <Canvas>
                <FrontierGraph
                    data={[
                        {x: 1, y: 2},
                        {x: 2, y: 4},
                    ]}
                    progress={{current: progress.current} as any}
                    colors={[0xffffff, 0xff0000]}
                    dataKeys={['x', 'y']}
                />
            </Canvas>
        )

        const {container} = render(<TestWrapper/>)
        expect(container).toBeTruthy()
    })

    it('renders a mesh line for each dataKey and calls setPoints with expected data', async () => {
        const data = [
            {index: 1, a: 1, b: 2},
            {index: 2, a: 2, b: 3},
            {index: 3, a: 3, b: 4},
        ]
        const progress = {current: 0.5}

        const renderer = await ReactThreeTestRenderer.create(
            <FrontierGraph
                data={data}
                progress={progress as any}
                colors={[0xff0000, 0x00ff00]}
                dataKeys={['a', 'b']}
            />, {width: 10, height: 10}
        )

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(1, 0.1)
        })

        console.log(renderer.toTree())
        console.log(renderer.scene.findAllByType("Mesh")[0].fiber.object.geometry.points)
    })


    it('minimal reproduction', async () => {

        const ref = { current: null as null | MeshLineGeometry }

        const Test = () => {
            useFrame(() => {
                if (ref.current) {
                    ref.current.setPoints([
                        new Vector3(0, 0, 0),
                        new Vector3(1, 1, 1),
                    ])
                }
            })
            return (
                <mesh>
                    <meshLineGeometry ref={ref} />
                    <meshLineMaterial color="hotpink" lineWidth={0.01} resolution={new Vector2(10, 10)} />
                </mesh>
            )
        }

        const renderer = await ReactThreeTestRenderer.create(<><Test /></>)

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(1, 0.1)
        })

        console.log(renderer.toTree())
        console.log(renderer.scene.findAllByType("Mesh")[0].fiber.object.geometry.points)
        console.log(
            renderer.scene.findAllByType("Mesh")[0].fiber.object.geometry.attributes.position.array
        )
    })
})
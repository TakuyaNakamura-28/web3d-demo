import {describe, it, expect} from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import {ForcePlateOverlay} from "./ForcePlateOverlay.tsx";
import {GridHelper} from "three";
import {plumMagenta, skyBlue, strawberryRed, teaGreen} from "./colors.ts";

describe('FrontierGraph', () => {

    it('renders overlay with correct positions', async () => {

        const renderer = await ReactThreeTestRenderer.create(
            <ForcePlateOverlay
                start={3}
                spacing={2}
                scale={4}
            />, {width: 10, height: 10}
        )

        expect(renderer.scene.findAllByType(GridHelper.name).length).toEqual(4)
        expect(renderer.scene.findAllByType(GridHelper.name)[0].props.position).toEqual([3, 0, 0])
        expect(renderer.scene.findAllByType(GridHelper.name)[1].props.position).toEqual([5, 0, 0])
        expect(renderer.scene.findAllByType(GridHelper.name)[2].props.position).toEqual([7, 0, 0])
        expect(renderer.scene.findAllByType(GridHelper.name)[3].props.position).toEqual([9, 0, 0])

        const scale = renderer.scene.findAllByType(GridHelper.name)[0].props.args[0]
        expect(scale).toEqual(3.92)
    })

    it('renders overlay with appropriate colors', async () => {

        const renderer = await ReactThreeTestRenderer.create(
            <ForcePlateOverlay
                start={3}
                spacing={2}
                scale={4}
            />, {width: 10, height: 10}
        )

        expect(renderer.scene.findAllByType(GridHelper.name)[0].props.args[3]).toEqual(teaGreen)
        expect(renderer.scene.findAllByType(GridHelper.name)[1].props.args[3]).toEqual(strawberryRed)
        expect(renderer.scene.findAllByType(GridHelper.name)[2].props.args[3]).toEqual(skyBlue)
        expect(renderer.scene.findAllByType(GridHelper.name)[3].props.args[3]).toEqual(plumMagenta)
    })
})
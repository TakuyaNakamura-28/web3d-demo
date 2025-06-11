export type ForcePlateDatum = { x: number, y: number, z: number, t: number, px: number, py: number }

export function parseForcePlateData(csvText: string): Array<Array<ForcePlateDatum>> {
    const csvPlateDataOffsets = [4, 37, 15, 26]
    return csvText.split('\n').slice(1).map(row => row.split(',')).filter(row => row.length > 1).map(row =>
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
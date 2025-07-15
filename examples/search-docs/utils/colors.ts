const colorPalette = [
    "bg-blue-50 text-blue-700",
    "bg-purple-50 text-purple-700",
    "bg-yellow-50 text-yellow-700",
    "bg-pink-50 text-pink-700",
    "bg-indigo-50 text-indigo-700",
    "bg-red-50 text-red-700",
    "bg-green-50 text-green-700",
];

export function getIndexColor(indexName: string) {
    let hash = 0;
    for (let i = 0; i < indexName.length; i++) {
        hash = indexName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
}
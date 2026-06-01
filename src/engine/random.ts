export function randomSeed() {
  return Math.floor(Math.random() * 1_000_000)
}

export function seeded(seed: number) {
  let value = seed % 2147483647
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

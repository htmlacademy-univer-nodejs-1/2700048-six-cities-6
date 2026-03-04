export function getRandomInt(min: number, max: number): number {
  const from = Math.ceil(min);
  const to = Math.floor(max);
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

export function getRandomFloat(min: number, max: number, digits = 1): number {
  const value = Math.random() * (max - min) + min;
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

export function getRandomItem<T>(items: readonly T[]): T {
  const index = getRandomInt(0, items.length - 1);
  return items[index];
}

export function getRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

export function getRandomSubset<T>(items: readonly T[]): T[] {
  const result: T[] = [];
  for (const item of items) {
    if (getRandomBoolean()) {
      result.push(item);
    }
  }

  if (result.length === 0 && items.length > 0) {
    result.push(getRandomItem(items));
  }

  return result;
}


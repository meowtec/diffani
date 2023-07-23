export function createArray<T>(length: number, init: (i: number) => T): T[] {
  const array = new Array(length);

  for (let i = 0; i < length; i++) {
    array[i] = init(i);
  }

  return array;
}

export function updateArrayAt<T>(array: T[], index: number, value: T): T[] {
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
}

export function removeArrayAt<T>(array: T[], index: number): T[] {
  const newArray = [...array];
  newArray.splice(index, 1);
  return newArray;
}

export function insertArrayAt<T>(array: T[], index: number, value: T): T[] {
  const newArray = [...array];
  newArray.splice(index, 0, value);
  return newArray;
}

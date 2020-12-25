
import { shuffle } from 'lodash'

export function genWinningArray(begin: number, end: number, count: number, ): number[] {
  let arr = [...Array(end - begin + 2).keys()].slice(1)

  return shuffle(arr).slice(0, count).sort((a, b) => a - b)
}

export function compareResult(lottery: number[], order: number[]): number[] {
  return lottery.filter(x => order.includes(x))
}

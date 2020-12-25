
export function isVaildComb(begin: number, end: number, count: number, combination: number[]): boolean {
  // NOTE: 驗證下單的數字有幾個
  if (combination.length !== count) {
    return false
  }

  let arr = [...Array(end - begin + 2).keys()].slice(1)

  // NOTE: 驗證有無數字不再有效範圍內，或是有重複
  if (arr.filter(x => combination.includes(x)).length !== count) {
    return false
  }
  return true
}

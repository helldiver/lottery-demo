
type state = -1 | 0 | 1

export interface IOrder {
  uid: string
  stage: number
  createdBy: string
  gameType: string
  combination: number[]
  state: state
  createdAt: number
  canceledAt?: number
}
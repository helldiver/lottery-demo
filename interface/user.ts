
type gender = 'male' | 'female' | 'unknown'

export interface IUser {
  uid: string
  email: string
  name?: string
  password: string
  gender: gender
  isVIP: boolean
  credit: number
  remark?: string
  tokens: string[]
  createdAt: number
  deletedAt?: number
}

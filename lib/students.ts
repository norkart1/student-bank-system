export interface Transaction {
  type: string
  amount: number
  date?: string
  reason?: string
}

export interface Student {
  id: string
  name: string
  mobile?: string
  email?: string
  username: string
  password: string
  profileImage?: string
  balance: number
  transactions: Transaction[]
}

export const defaultStudents: Student[] = []

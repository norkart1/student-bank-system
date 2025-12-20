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

export const defaultStudents: Student[] = [
  {
    id: "1",
    name: "Dara Sok",
    mobile: "9876543210",
    email: "dara@example.com",
    username: "dara_sok",
    password: "12345",
    balance: 1250.0,
    transactions: [
      { type: "deposit", amount: 1500, date: "Dec 15, 2025" },
      { type: "withdraw", amount: 250, date: "Dec 16, 2025" },
    ],
  },
  {
    id: "2",
    name: "Sophea Chan",
    mobile: "9876543211",
    email: "sophea@example.com",
    username: "sophea_chan",
    password: "12345",
    balance: 890.5,
    transactions: [
      { type: "deposit", amount: 1000, date: "Dec 14, 2025" },
      { type: "withdraw", amount: 109.5, date: "Dec 16, 2025" },
    ],
  },
  {
    id: "3",
    name: "Visal Meng",
    mobile: "9876543212",
    email: "visal@example.com",
    username: "visal_meng",
    password: "12345",
    balance: 2100.0,
    transactions: [
      { type: "deposit", amount: 2500, date: "Dec 12, 2025" },
      { type: "withdraw", amount: 400, date: "Dec 15, 2025" },
    ],
  },
  {
    id: "4",
    name: "Sreynich Phan",
    mobile: "9876543213",
    email: "sreynich@example.com",
    username: "sreynich_phan",
    password: "12345",
    balance: 675.25,
    transactions: [
      { type: "deposit", amount: 800, date: "Dec 13, 2025" },
      { type: "withdraw", amount: 124.75, date: "Dec 17, 2025" },
    ],
  },
  {
    id: "5",
    name: "Ratanak Ly",
    mobile: "9876543214",
    email: "ratanak@example.com",
    username: "ratanak_ly",
    password: "12345",
    balance: 1580.0,
    transactions: [
      { type: "deposit", amount: 2000, date: "Dec 10, 2025" },
      { type: "withdraw", amount: 420, date: "Dec 14, 2025" },
    ],
  },
]

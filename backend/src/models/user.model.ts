export interface User {
  id: number
  username: string
  password: string
  fullname: string
  email: string
  phoneNumber: string
  gender: boolean
  address: string
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'
}

export interface UserPayload {
  id: number
  username: string
  role: string
}
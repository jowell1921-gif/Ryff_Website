export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  location: string | null
  instruments: string[]
  genres: string[]
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

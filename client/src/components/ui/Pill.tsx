import type { ReactNode } from 'react'

interface PillProps {
  variant?: 'filled' | 'outline'
  size?: 'default' | 'sm'
  children: ReactNode
}

const styles = {
  filled: 'rounded-full bg-purple-600 border border-purple-500 font-semibold',
  outline: 'rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold',
}

const sizes = {
  default: { padding: '5px 12px', fontSize: 12 },
  sm:      { padding: '4px 10px',  fontSize: 8  },
}

export function Pill({ variant = 'filled', size = 'default', children }: PillProps) {
  return (
    <span className={styles[variant]} style={{ ...sizes[size], color: 'white' }}>
      {children}
    </span>
  )
}

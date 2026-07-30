import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue = unknown> {
    width?: number
    sticky?: 'left' | 'right'
  }
}

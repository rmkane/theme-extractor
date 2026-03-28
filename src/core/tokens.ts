export interface LexToken {
  type: string
  value: string
}

export interface BlueprintToken extends LexToken {
  index: number
  startLine: number
  startColumn: number
  isWhitespace: boolean
}

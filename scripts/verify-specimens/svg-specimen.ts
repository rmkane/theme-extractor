import { normalizeHex } from '@/core/normalize-hex'

export interface SvgRun {
  text: string
  color: string | null
}

export interface ExpectedChar {
  character: string
  color: string | null
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export function extractSvgCodeRuns(svgContent: string): SvgRun[] {
  const monoTextMatch =
    svgContent.match(/<text[^>]*font-family="[^"]*SFMono-Regular[^"]*"[^>]*>[\s\S]*?<\/text>/) ||
    svgContent.match(/<text[^>]*font-family='[^']*SFMono-Regular[^']*'[^>]*>[\s\S]*?<\/text>/)

  if (!monoTextMatch) {
    throw new Error('Unable to find monospaced code block in specimen SVG.')
  }

  const monoTextBlock = monoTextMatch[0]!
  const inheritedFillMatch = monoTextBlock.match(/<text[^>]*\sfill="(#[0-9A-Fa-f]{3,8})"/)
  const inheritedFill = normalizeHex(inheritedFillMatch?.[1] ?? null)

  const runPattern = /<tspan([^>]*)>([^<]*)<\/tspan>/g
  const runs: SvgRun[] = []
  let match: RegExpExecArray | null

  while ((match = runPattern.exec(monoTextBlock)) !== null) {
    const attrs = match[1] ?? ''
    const text = decodeEntities(match[2] ?? '')
    if (!text) {
      continue
    }

    const fillMatch = attrs.match(/\sfill="(#[0-9A-Fa-f]{3,8})"/)
    const color = normalizeHex(fillMatch?.[1] ?? inheritedFill)

    runs.push({ text, color })
  }

  return runs
}

export function buildExpectedCharStreamFromSvg(svgContent: string): ExpectedChar[] {
  const runs = extractSvgCodeRuns(svgContent)
  const stream: ExpectedChar[] = []

  for (const run of runs) {
    for (const character of run.text) {
      if (character === '\n' || character === '\r') {
        continue
      }
      stream.push({ character, color: run.color })
    }
  }

  return stream
}

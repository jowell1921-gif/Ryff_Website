export type EmbedType = 'youtube' | 'spotify' | 'soundcloud'

export interface EmbedInfo {
  type: EmbedType
  embedUrl: string
}

export function detectEmbed(text: string): EmbedInfo | null {
  const yt = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return {
    type: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`,
  }

  const sp = text.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
  if (sp) return {
    type: 'spotify',
    embedUrl: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}?utm_source=generator&theme=0`,
  }

  const sc = text.match(/soundcloud\.com\/([\w-]+\/[\w-]+)/)
  if (sc) return {
    type: 'soundcloud',
    embedUrl: `https://w.soundcloud.com/player/?url=https://soundcloud.com/${sc[1]}&color=%236d28d9&auto_play=false&hide_related=true&show_comments=false`,
  }

  return null
}

export function embedHeight(type: EmbedType): number {
  if (type === 'youtube') return 280
  if (type === 'spotify') return 152
  if (type === 'soundcloud') return 120
  return 200
}

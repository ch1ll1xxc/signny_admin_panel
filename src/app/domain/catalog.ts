export interface ExhibitSummary {
  id: number
  name: string
  hall: string
  status: 'Published' | 'Draft' | 'OnReview'
  hasVideo: boolean
  hasSubtitles: boolean
  subtitlesType: 'embedded' | 'file' | null
  updated: string
}

export interface MediaFile {
  id: number
  name: string
  type: 'video' | 'subtitles'
  status: 'ready' | 'processing'
  usedIn: string[]
  uploadDate: string
  size: string
}

export interface HallSummary {
  id: number
  name: string
  code: string
  exhibitsCount: number
}

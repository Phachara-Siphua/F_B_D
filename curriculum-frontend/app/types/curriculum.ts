export interface Subject {
  id: string
  code: string
  nameTh: string
  nameEn: string
  credits: string        // e.g. "3(3-0-6)"
  prereqs?: string[]     // subject ids this depends on
  isHighlight?: boolean  // blue boxes in the diagram
}

export interface Semester {
  id: string
  year: number
  term: number           // 1 or 2
  subjects: Subject[]
}
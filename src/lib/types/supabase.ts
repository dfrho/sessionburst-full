export type Session = {
  id: number
  created_at: string
  user_id: string
  stagehand_session_id: string
  actions: {
    type: 'goto' | 'act' | 'extract' | 'observe'
    value: string
  }[]
  options: {
    browser?: string
    device?: string
  }
  status: 'created' | 'running' | 'completed' | 'failed'
  results?: any
  error?: string
} 
type StagehandAction = {
  type: 'goto' | 'act' | 'extract'
  value: string
}

export function parsePrompt(prompt: string): StagehandAction[] {
  const actions: StagehandAction[] = []
  const lines = prompt.split('\n')

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    
    if (trimmed.startsWith('goto ')) {
      actions.push({
        type: 'goto',
        value: line.slice(5).trim()
      })
    } else if (trimmed.startsWith('act ')) {
      actions.push({
        type: 'act',
        value: line.slice(4).trim()
      })
    } else if (trimmed.startsWith('extract ')) {
      actions.push({
        type: 'extract',
        value: line.slice(8).trim()
      })
    }
  }

  return actions
} 
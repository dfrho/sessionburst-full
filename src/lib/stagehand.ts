import { chromium } from 'playwright-core';

type StagehandConfig = {
  projectId: string;
  apiKey: string;
  llmProvider: 'openai' | 'anthropic';
  llmApiKey: string;
  baseUrl?: string;
}

type SessionAction = {
  type: 'goto' | 'act' | 'extract' | 'observe';
  value: string;
}

type CreateSessionRequest = {
  actions: SessionAction[];
  options?: {
    browser?: 'chromium' | 'firefox' | 'webkit';
    device?: string;
    location?: string;
    context?: {
      extensions?: boolean;
      captchaSolving?: boolean;
    };
  };
}

export class StagehandClient {
  private apiKey: string;

  constructor(config: StagehandConfig) {
    if (!config.apiKey) {
      throw new Error('Missing required Stagehand configuration')
    }
    this.apiKey = config.apiKey;
  }

  async createSession(request: CreateSessionRequest) {
    try {
      const browser = await chromium.connectOverCDP(
        `wss://connect.browserbase.com?apiKey=${this.apiKey}`
      );

      // Getting the default context to ensure the sessions are recorded
      const defaultContext = browser.contexts()[0];
      const page = defaultContext.pages()[0];

      // Execute each action sequentially
      for (const action of request.actions) {
        if (action.type === 'goto') {
          await page.goto(action.value);
        } else if (action.type === 'act') {
          await page.evaluate(action.value);
        } else if (action.type === 'extract') {
          await page.evaluate(action.value);
        }
      }

      await page.close();
      await browser.close();

      return { success: true };
    } catch (error) {
      console.error('Stagehand createSession error:', error);
      throw error;
    }
  }
}

// Initialize with only required fields
export const stagehand = new StagehandClient({
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  apiKey: process.env.BROWSERBASE_API_KEY!,
  llmProvider: 'anthropic',  // This won't be used in requests
  llmApiKey: process.env.ANTHROPIC_API_KEY!  // This won't be used in requests
});

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
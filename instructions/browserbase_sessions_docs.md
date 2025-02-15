# Browserbase Sessions

Each browser run is a Session, controlled through our APIs.

## Overview

In web automation, a browser session represents a single browser instance, from connection to termination: closure, timeout, or disconnection. Sessions run in isolated environments to ensure resource exclusivity, thereby maintaining stability and performance.

These sessions are highly configurable through APIs, allowing for adjustments to settings such as running in a selected geographic region or specifying a keep-alive session.

Sessions also support on-the-fly file downloads and can be easily started with automation frameworks like Playwright, Puppeteer, or Selenium, or pre-configured using a Session API, offering flexibility and control for developers.

## Browser Configuration

Sessions run on fast instances with isolated resources (storage, network, memory, and vCPUs).

The viewport, user agents, and header configuration are handled by the fingerprint mechanism.

Downloads are enabled and stored by default, accessible via the API.

## Sessions

### Starting a Session

A session is either created implicitly upon connection (via `connectOverCDP()` or `puppeteer.connect()`), or via the Sessions API.

Once created, connect to a session through a Driver (Playwright, Puppeteer, or Selenium) or via the Session Inspector.

#### Playwright (Node.js)

```javascript
import { chromium } from "playwright-core";

(async () => {
  const browser = await chromium.connectOverCDP(
    `wss://connect.browserbase.com?apiKey=${process.env.BROWSERBASE_API_KEY}`
  );
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  await page.goto("https://www.browserbase.com");

  await page.close();
  await browser.close();
})();
```

You must connect to a session within the timeout supplied during creation or the default timeout of your project.

### Asynchronous Sessions

You can also create and manage sessions asynchronously. This is useful if you want to run your automation in an asynchronous environment, such as an asyncio event loop.

#### Playwright (Python)

```python
import os
from playwright.async_api import async_playwright, Page
import asyncio

API_KEY = os.environ.get("BROWSERBASE_API_KEY")

async def run(browser_tab: Page):
    await browser_tab.goto("https://www.sfmoma.org")
    await browser_tab.get_by_role("link", name="Tickets").click()
    print(f"Current URL: {browser_tab.url} | Page title: {await browser_tab.title()}")

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.connect_over_cdp(
            f"wss://connect.browserbase.com?apiKey={API_KEY}"
        )
        print(
            f"Connected to Browserbase. {browser.browser_type.name} version {browser.version}"
        )
        context = browser.contexts[0]
        browser_tab = context.pages[0]
        await run(browser_tab)

if __name__ == "__main__":
    asyncio.run(main())
```

## Session Timeout

Sessions time out when running longer than the timeout configured in your Project’s Settings.

To keep sessions alive upon disconnections, provide the `keepAlive` parameter when creating a new session and stop the session manually.

#### Node.js

```javascript
import Browserbase from "browserbase";

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

const bb = new Browserbase(BROWSERBASE_API_KEY);

const session = await bb.sessions.create({
  projectId: BROWSERBASE_PROJECT_ID,
  keepAlive: true,
});

await bb.sessions.update(session.id, {
  projectId: BROWSERBASE_PROJECT_ID,
  status: "REQUEST_RELEASE",
});
```

For more information on using keep-alive sessions, refer to our Long Running Sessions guide.

## Inspecting a Session

You can inspect a completed session using the Session API or the Session Inspector.

| Action | Session Inspector | Sessions API |
|--------|------------------|--------------|
| Access logs | ✅ | Sessions API logs endpoint |
| Access ChromeDevTools data | ✅ | Sessions API logs endpoint |
| Access recording | ✅ | Sessions API recording endpoint |
| Retrieve downloaded files | ❌ | Sessions API downloads endpoint |
| Session Live View | ❌ | Sessions API Live URLs endpoint |
| Access memory and CPU usage | ✅ | ❌ |

## Session Concurrency and Rate Limiting

The number of concurrent browsers you can run depends on your plan:

| Plan | Free | Hobby | Startup | Scale |
|------|------|-------|---------|-------|
| Concurrent Browsers | 1 | 3 | 50 | 100+ |

Reaching the session concurrency limit results in an HTTP 429 Too Many Requests error. To check your rate limit status, look at the response headers:

- `x-ratelimit-limit` - Total allowed requests
- `x-ratelimit-remaining` - Remaining requests
- `x-ratelimit-reset` - Time until reset (seconds)
- `retry-after` - Wait time before retrying (seconds)

## User Metadata

User metadata allows you to attach arbitrary JSON data to sessions for better querying.

### Attaching Metadata

```bash
curl --request POST \  
  --url "https://api.browserbase.com/v1/sessions" \  
  --header 'Content-Type: application/json' \  
  --header 'X-BB-API-Key: <api-key>' \  
  --data '{"projectId": "<project-id>", "userMetadata": {"order": {"status": "shipped"}}}'
```

### Querying Metadata

```bash
curl --request GET \  
  --url "https://api.browserbase.com/v1/sessions?q=user_metadata%5B'order'%5D%5B'status'%5D%3A'shipped'" \  
  --header 'X-BB-API-Key: <api-key>'
```

This returns all sessions with metadata `{ "order": { "status": "shipped" } }`. Only string equality queries are supported currently, but future updates may expand functionality.


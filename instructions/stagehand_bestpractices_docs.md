# Stagehand Best Practices

## How to get the most out of Stagehand

### Prompting Tips

Prompting Stagehand is more literal and atomic than other higher-level frameworks, including agentic frameworks. Here are some guidelines to help you craft effective prompts:

### Do

#### Use `act()` as a fallback when Playwright fails

```javascript
try {
    // Wait for search button and click it
    const quickStartSelector = `#content-area > div.relative.mt-8.prose.prose-gray.dark\:prose-invert > div > a:nth-child(1)`;
    await page.waitForSelector(quickStartSelector);
    await page.locator(quickStartSelector).click();
    await page.waitForLoadState("networkidle");
} catch {
    // Use Stagehand as a fallback to get the job done
    console.log("Error occurred, falling back to Stagehand");
    await page.act({
        action: "Click the link to the quickstart",
    });
}
```

#### Use specific and concise actions

```javascript
await page.act({ action: "click the login button" });

const productInfo = await page.extract({
  instruction: "find the red shoes",
  schema: z.object({
    productName: z.string(),
    price: z.number(),
  }),
});
```

#### Break down complex tasks into smaller, atomic steps

Instead of combining actions:

```javascript
// Avoid this
await page.act({ action: "log in and purchase the first item" });
```

Split them into individual steps:

```javascript
await page.act({ action: "click the login button" });
// ...additional steps to log in...
await page.act({ action: "click on the first item" });
await page.act({ action: "click the purchase button" });
```

#### Use `observe()` to get actionable suggestions from the current page

```javascript
const actions = await page.observe();
console.log("Possible actions:", actions);

// You can also use `observe()` with a custom prompt
const buttons = await page.observe({
    instruction: "find all the buttons on the page",
});
```

---

### Don’t

#### Use broad or ambiguous instructions

```javascript
// Too vague
await page.act({ action: "find something interesting on the page" });
```

#### Combine multiple actions into one instruction

```javascript
// Avoid combining actions
await page.act({ action: "fill out the form and submit it" });
```

#### Expect Stagehand to perform high-level planning or reasoning

```javascript
// Outside Stagehand's scope
await page.act({ action: "book the cheapest flight available" });
```

By following these guidelines, you’ll increase the reliability and effectiveness of your web automations with Stagehand. Remember, Stagehand excels at executing precise, well-defined actions, so keeping your instructions atomic will lead to the best outcomes.

We leave the agentic behavior to higher-level agentic systems which can use Stagehand as a tool.

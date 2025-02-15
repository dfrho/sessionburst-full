# How Stagehand Works

Go behind the scenes

## How It Works

The SDK has two major phases:

1. Processing the DOM (including chunking - see below).
2. Taking LLM powered actions based on the current state of the DOM.

### DOM Processing

Stagehand uses a combination of techniques to prepare the DOM.

The DOM Processing steps look as follows:

1. Via Playwright, inject a script into the DOM accessible by the SDK that can run processing.
2. Crawl the DOM and create a list of candidate elements.
   - Candidate elements are either leaf elements (DOM elements that contain actual user-facing substance), or are interactive elements.
   - Interactive elements are determined by a combination of roles and HTML tags.
3. Candidate elements that are not active, visible, or at the top of the DOM are discarded.
   - The LLM should only receive elements it can faithfully act on on behalf of the agent/user.
4. For each candidate element, an [xPath](https://developer.mozilla.org/en-US/docs/Web/XPath) is generated. This guarantees that if this element is picked by the LLM, we’ll be able to reliably target it.
5. Return both the list of candidate elements, as well as the map of elements to xPath selectors across the browser back to the SDK, to be analyzed by the LLM.

#### Chunking

While LLMs will continue to increase context window length and reduce latency, giving any reasoning system less to process should make it more reliable. As a result, DOM processing is done in chunks to keep the context small per inference call. To chunk, the SDK considers a candidate element that starts in a section of the viewport to be a part of that chunk. In the future, padding will be added to ensure that an individual chunk does not lack relevant context.

![Chunking Example](https://mintlify.s3.us-west-1.amazonaws.com/stagehand/images/chunks.png)

### Vision

The `act()` and `observe()` methods can take a `useVision` flag. If this is set to `true`, the LLM will be provided with an annotated screenshot of the current page to identify which elements to act on. This is useful for complex DOMs that the LLM has a hard time reasoning about, even after processing and chunking. By default, this flag is set to `"fallback"`, which means that if the LLM fails to successfully identify a single element, Stagehand will retry the attempt using vision.

### LLM Analysis

Now we have a list of candidate elements and a way to select them. We can present those elements with additional context to the LLM for extraction or action. While untested on a large scale, presenting a “numbered list of elements” guides the model to not treat the context as a full DOM, but as a list of related but independent elements to operate on.

In the case of action, we ask the LLM to write a Playwright method to perform the correct action. In our limited testing, Playwright syntax is much more effective than relying on built-in JavaScript APIs, possibly due to tokenization.

Lastly, we use the LLM to write future instructions to itself to help manage its progress and goals when operating across chunks.

### Stagehand vs. Playwright

Below is an example of how to extract a list of companies from the AI Grant website using both Stagehand and Playwright.

![Stagehand vs. Playwright](https://mintlify.s3.us-west-1.amazonaws.com/stagehand/images/stagehand-playwright.png)

[Best Practices](https://docs.stagehand.dev/get_started/best_practices) | [Contribute to Stagehand](https://docs.stagehand.dev/get_started/contribute)

[GitHub](https://github.com/stagehand) | [NPM Package](https://www.npmjs.com/package/stagehand)

Powered by [Mintlify](https://mintlify.com)

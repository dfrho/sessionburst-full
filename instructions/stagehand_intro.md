# Introduction

**Stagehand** is the AI interface to the internet.

Stagehand is the easiest way to build browser automations. It is completely interoperable with **Playwright** and has seamless integration with **Browserbase**.

It offers three simple AI APIs (**act, extract, and observe**) on top of the base Playwright `Page` class that provide the building blocks for web automation via natural language.

Anything that can be done in a browser can be done with Stagehand. Think about tasks like:

- Log into Amazon, search for AirPods, and buy the most relevant product  
- Go to Hacker News and extract the top stories of the day  
- Go to DoorDash, find the cheapest pad thai, and order it to your house  

These automations can be built with Playwright, but writing the code can be cumbersome and vulnerable to minor UI changes.

Stagehand's AI, especially when combined with **Browserbase's stealth mode**, makes it easy to write durable code and bypass bot detection and captchas.

---

## 🎬 Lights, Camera, act()

Let's get you started with Stagehand.

### 🚀 Quickstart

Build browser automations in no time.

### 🎭 How Stagehand Works

Go behind the scenes with Stagehand.

---

## ❓ FAQ

### What is Stagehand?

Stagehand is the AI-powered successor to Playwright, offering three simple APIs (**act, extract, and observe**) that provide the building blocks for web automation via natural language.

The goal of Stagehand is to provide a **lightweight, model-agnostic framework**, without overly complex abstractions. It's not going to order you a pizza, but it will help you execute steps like `"click the order button"`.

Each Stagehand function takes in an **atomic instruction**, such as:  

```js
act("click the login button")
extract("find the price of pad thai")
```

...then generates the appropriate Playwright code to accomplish that instruction, and executes it.

### What is a web agent?

A web agent is an AI agent that aims to browse the web like a human. They can navigate the web, interact with web pages, and perform tasks. You could imagine something like telling a bot "here's my credit card, order me pad thai" and having it do that entirely autonomously.

### Is Stagehand a web agent?

No, Stagehand is not a web agent. It is a set of tools that enables and empowers web agents and developers building them. A web agent could take an instruction like "order me pad thai" and use Stagehand to navigate to the restaurant's website, find the menu, and order the food.

### What are some best practices for using Stagehand?

Stagehand is something like Github Copilot, but for web automation. It's not a good idea to ask it to write your entire application, but it's great for quickly generating self-healing Playwright code to accomplish specific tasks.

Therefore, instructions should be atomic to increase reliability, and step planning should be handled by the higher level agent. You can use observe() to get a suggested list of actions that can be taken on the current page, and then use those to ground your step planning prompts.

### Who built Stagehand?

Stagehand is open source and maintained by the Browserbase team. We envision a world in which web agents are built with Stagehand on Browserbase.

We believe that by enabling more developers to build reliable web automations, we'll expand the market of developers who benefit from our headless browser infrastructure. This is the framework that we wished we had while tinkering on our own applications, and we're excited to share it with you.

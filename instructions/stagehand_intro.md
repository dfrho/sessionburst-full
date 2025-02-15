# Introduction

**Stagehand** is the AI interface to the internet.

Stagehand is the easiest way to build browser automations. It is completely interoperable with **Playwright** and has seamless integration with **Browserbase**.

It offers three simple AI APIs (**act, extract, and observe**) on top of the base Playwright `Page` class that provide the building blocks for web automation via natural language.

Anything that can be done in a browser can be done with Stagehand. Think about tasks like:

- Log into Amazon, search for AirPods, and buy the most relevant product  
- Go to Hacker News and extract the top stories of the day  
- Go to DoorDash, find the cheapest pad thai, and order it to your house  

These automations can be built with Playwright, but writing the code can be cumbersome and vulnerable to minor UI changes.

Stagehand’s AI, especially when combined with **Browserbase’s stealth mode**, makes it easy to write durable code and bypass bot detection and captchas.

---

## 🎬 Lights, Camera, act()

Let’s get you started with Stagehand.

### 🚀 Quickstart

Build browser automations in no time.

### 🎭 How Stagehand Works 

Go behind the scenes with Stagehand.

---

## ❓ FAQ

### What is Stagehand?

Stagehand is the AI-powered successor to Playwright, offering three simple APIs (**act, extract, and observe**) that provide the building blocks for web automation via natural language.

The goal of Stagehand is to provide a **lightweight, model-agnostic framework**, without overly complex abstractions. It’s not going to order you a pizza, but it will help you execute steps like `"click the order button"`.

Each Stagehand function takes in an **atomic instruction**, such as:  

```js
act("click the login button")
extract("find the price of pad thai")

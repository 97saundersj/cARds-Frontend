# cARds Frontend

## Overview

cARds is an augmented reality greeting card application that lets you create and share personalized AR experiences. Design custom greeting cards with your own text and images, then view them in augmented reality using your mobile device.

## Features

- **Create Custom Cards**: Choose from birthday, valentine, halloween, christmas themes or upload your own image
- **Personalize Text**: Add custom messages to the top, middle, and bottom of your card
- **Customize Landing Page**: Set a custom header and welcome message
- **AR Experience**: View your cards in augmented reality using your phone's camera
- **Easy Sharing**: Generate a shareable link to send your AR card to anyone

## How to Use

### Creating a Card

1. Visit the home page
2. Fill out the card customization form:
   - Set your landing page header and message
   - Choose a card theme or upload a custom image
   - Add your personalized text
3. Click "Generate Card" to create a shareable link
4. Click "Try it out" to preview your AR card

### Viewing an AR Card

1. Open the card link on your mobile device
2. Tap the AR button to launch the experience
3. Follow the on-screen instructions to view the card in AR

## Developer Documentation

### Technical Overview

This application is built with React Router.

### Technologies

- **React Router v7**: Modern routing
- **Firebase**: Image upload
- **Bootstrap 5**: UI framework (via CDN)
- **Font Awesome**: Icons (via CDN)
- **TypeScript**: Type safety

### Prerequisites

- Node.js (v18 or higher)
- npm
- **Unity AR Card Viewer**: You need to get the Unity WebXR AR card viewer and build it from [https://github.com/97saundersj/WebXR-Card](https://github.com/97saundersj/WebXR-Card)

### Installation

```bash
npm install
```

**Note**: The Unity AR card viewer must be built and available for the full AR experience to work. Clone and build the [WebXR-Card repository](https://github.com/97saundersj/WebXR-Card) separately to serve the AR viewer component.

### How to Run

#### Development Mode (Full Stack)

Run both the React frontend and Unity AR server:

```bash
npm run dev:all
```

This runs both services concurrently - the frontend at `http://localhost:5173` and the Unity server.

#### Frontend Only

Run just the React application:

```bash
npm run dev
```

#### Unity Server Only

Run just the Unity AR server:

```bash
npm run serve:unity
```

#### Production Build

Build and run the production version:

```bash
npm run build
npm run start
```

### Build

```bash
npm run build
```

# cARds Frontend - React Conversion

## Overview

This project has been converted from static HTML files to a modern React application using React Router v7. The original `index.html` and `viewCard.html` files have been transformed into reusable React components.

## Components

### CardEditor (`app/components/CardEditor.tsx`)

- **Purpose**: Card customization form (converted from `index.html`)
- **Features**:
  - Landing page customization (header, message)
  - Card image selection (birthday, valentine, halloween, christmas, custom)
  - Custom image upload with Firebase integration
  - Card text customization (top, middle, bottom)
  - Modal for sharing generated card links
  - Copy and share functionality

### ViewCard (`app/components/ViewCard.tsx`)

- **Purpose**: AR card viewer (converted from `viewCard.html`)
- **Features**:
  - Unity WebXR integration
  - AR instructions modal
  - Dynamic content loading from URL parameters
  - Unity URL parameter support

## Routes

- **Home Route** (`/`): CardEditor component
- **View Card Route** (`/view-card`): ViewCard component with URL parameters

## New Features

### Unity URL Support

Both components now support a `unityUrl` parameter:

```javascript
// Example usage
/view-card?header=Happy%20Birthday&unityUrl=https:/ / your -
  custom -
  unity -
  build.com;
```

This allows you to:

- Host Unity builds on different servers or CDNs
- Use different Unity builds for different environments
- Override the default "Build" path

## URL Parameters

The application supports the same URL parameters as the original HTML files:

| Parameter    | Description                   | Example                          |
| ------------ | ----------------------------- | -------------------------------- |
| `header`     | Landing page header text      | `Happy Birthday!`                |
| `message`    | Landing page message text     | `Experience your AR card below.` |
| `cardImage`  | Card image type or custom URL | `birthday` or custom URL         |
| `cardTop`    | Top text on the card          | `Dear John,`                     |
| `cardMiddle` | Middle text on the card       | `Have a great birthday!`         |
| `cardBottom` | Bottom text on the card       | `Love Jane`                      |
| `unityUrl`   | Custom Unity build URL (new)  | `https://your-unity-build.com`   |

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Dependencies

- **React Router v7**: Modern routing with file-based routing
- **Firebase**: Image upload functionality
- **Bootstrap 5**: UI framework (via CDN)
- **Font Awesome**: Icons (via CDN)
- **TypeScript**: Type safety

## Migration Benefits

1. **Modern React Architecture**: Better state management and component reusability
2. **Type Safety**: Full TypeScript support
3. **Better Routing**: React Router integration with proper navigation
4. **Maintainability**: Modular component structure
5. **Enhanced Features**: Improved error handling and loading states
6. **Flexibility**: Unity URL parameter support for different deployment scenarios
7. **Better UX**: Improved modal interactions and form handling

## Firebase Configuration

The Firebase configuration remains the same as in the original HTML files. Update the config in `CardEditor.tsx` if needed for your environment.

## Usage Examples

### Basic Card Generation

1. Navigate to `/` (home route)
2. Fill out the card customization form
3. Click "Generate Card" to get a shareable link
4. Click "Try it out" to view the AR card

### Direct Card Viewing with Parameters

```
/view-card?header=Happy%20Birthday&message=Enjoy%20your%20AR%20card&cardTop=Dear%20John&cardMiddle=Have%20a%20great%20birthday&cardBottom=Love%20Jane&cardImage=birthday
```

### Custom Unity Build

```
/view-card?header=Happy%20Birthday&unityUrl=https://your-custom-unity-build.com
```

## File Structure

```
cards-frontend/
├── app/
│   ├── components/
│   │   ├── CardEditor.tsx      # Card customization form
│   │   └── ViewCard.tsx        # AR card viewer
│   ├── routes/
│   │   ├── home.tsx           # Home route
│   │   └── view-card.tsx      # View card route
│   ├── root.tsx               # Root layout
│   ├── routes.ts              # Route configuration
│   └── app.css               # Global styles
├── package.json
└── README.md
```

The application is now ready for development and deployment with modern React practices while maintaining all the original functionality.

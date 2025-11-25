````markdown
# GEMINI.md

## Project Overview

This is a monorepo for Previlace, an AI-enhanced civil service review system. The project is a web application with a client-server architecture.

*   **Client:** The client is a React application built with Vite. It uses React Router for routing, Zustand for state management, and Tailwind CSS for styling. It also includes dependencies like `axios` for making HTTP requests and `socket.io-client` for real-time communication.

*   **Server:** The server is a Node.js application using the Express framework. It uses MongoDB as the database and has authentication implemented with `bcryptjs`, `jsonwebtoken`, `passport`, and `passport-google-oauth20`. It also uses `socket.io` for real-time communication.

## Building and Running

### Prerequisites

*   Node.js and pnpm
*   MongoDB

### Installation

1.  Install dependencies for both the client and server:

    ```bash
    pnpm install:all
    ```

### Running the Application

1.  **Start the server:**

    ```bash
    pnpm dev:server
    ```

2.  **Start the client:**

    ```bash
    pnpm dev:client
    ```

### Building the Client

To create a production build of the client, run:

```bash
pnpm build
```

## Development Conventions

*   **Code Style:** The project uses Prettier for code formatting.
*   **Linting:** ESLint is used for linting the client-side code.
*   **State Management:** Zustand is used for state management in the client.
*   **API Communication:** The client communicates with the server using a combination of RESTful APIs (via `axios`) and WebSockets (via `socket.io-client`).
````


This will create optimized builds for both the client and server.

## Development Conventions

### General Rules

*   No logs unless explicitly asked.
*   No comments unless explicitly asked.
*   Code must be clean, professional, and to industry standard.
*   No emojis, no AI disclaimers, no unnecessary explanations.
*   Do not add filler statements about system status or functionality.
*   No unnecessary debugging code. Fix issues directly.
*   Do not place documentation or tests in the code directory.
*   Remove unused imports and functions.
*   Never use `Alert.alert`.
*   Use industry-standard naming conventions.
*   Consolidate files if it makes sense to do so.
*   Remove `console.log` statements, but keep `console.error` statements that are only shown when `NODE_ENV` is `development`.

### Function Declaration Patterns

*   **Primary component functions & utilities:** Use traditional function syntax:
    ```javascript
    function handleSubmit() {
      // Implementation
    }
    ```
*   **Arrow functions are allowed only for:**
    *   React hook callbacks: `useEffect(() => { fetchData(); }, []);`
    *   Zustand store methods: `fetchJobs: async () => { ... }`
    *   Inline callbacks: `items.filter((item) => item.active)`
    *   Event handlers in JSX: `<Button onPress={(e) => handlePress(e)} />`

### Backend

*   Always use the Active Record Pattern.

### File Handling

*   When removing files, move them to the `archive` folder.
*   Use Windows-style paths.
*   When writing files, first analyze the project structure to determine the correct location. Then, write the files directly using the filesystem connector.
*   Exclude the following patterns when searching for files: `["node_modules", "dist", "build", ".git", ".expo", "*.removed"]`

### Post-Output Documentation (Mandatory)

After every code output, append:

```
Files Changed:
- /relative/path/to/file — short description
```

### Code Formatting

Follow this Prettier configuration:

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

{
  "designSystem": {
    "name": "Previlace Minimalist Design System",
    "version": "1.0.0",
    "philosophy": "Clean, functional, and focused. Use black, white, and gray as the foundation. Color is reserved for calls-to-action and critical information highlights.",
    
    "colorPalette": {
      "primary": {
        "black": "#000000",
        "description": "Primary actions, headers, important text",
        "usage": ["buttons-primary", "headings", "active-states", "icons-primary"]
      },
      "neutral": {
        "white": "#FFFFFF",
        "gray50": "#F9FAFB",
        "gray100": "#F3F4F6",
        "gray200": "#E5E7EB",
        "gray300": "#D1D5DB",
        "gray600": "#4B5563",
        "gray700": "#374151",
        "gray900": "#111827",
        "description": "Backgrounds, borders, secondary text",
        "usage": ["backgrounds", "cards", "borders", "secondary-text", "disabled-states"]
      },
      "accent": {
        "green500": "#10B981",
        "green600": "#059669",
        "yellow500": "#F59E0B",
        "yellow600": "#D97706",
        "red500": "#EF4444",
        "red600": "#DC2626",
        "blue500": "#3B82F6",
        "blue600": "#2563EB",
        "description": "RESERVED for important highlights and status indicators ONLY",
        "usage": {
          "green": ["correct-answers", "success-states", "completed-items"],
          "yellow": ["warnings", "in-progress"],
          "red": ["errors", "incorrect-answers", "alerts"],
          "blue": ["info-only-when-critical"]
        },
        "rules": [
          "Never use accent colors for decorative purposes",
          "Use sparingly to draw attention to critical elements",
          "Prefer gray variants over accent colors when possible"
        ]
      }
    },

    "typography": {
      "fontFamily": "System font stack (inherits from Tailwind)",
      "scale": {
        "h1": {
          "className": "text-3xl font-bold text-gray-900",
          "usage": "Page titles"
        },
        "h2": {
          "className": "text-2xl font-bold text-gray-900",
          "usage": "Section headers"
        },
        "h3": {
          "className": "text-xl font-bold text-gray-900",
          "usage": "Card titles, subsection headers"
        },
        "body": {
          "className": "text-base text-gray-700",
          "usage": "Primary body text"
        },
        "bodySecondary": {
          "className": "text-sm text-gray-600",
          "usage": "Secondary information, captions"
        },
        "caption": {
          "className": "text-xs text-gray-500",
          "usage": "Metadata, timestamps, hints"
        }
      },
      "rules": [
        "Never use ALL CAPS except for very short labels (2-3 chars)",
        "Sentence case for all headings and buttons",
        "Limit font weights to: regular (400), medium (500), semibold (600), bold (700)"
      ]
    },

    "spacing": {
      "scale": "Tailwind default spacing scale (4px base unit)",
      "cardPadding": "p-6",
      "pagePadding": "px-4 py-6 sm:px-6 lg:px-8",
      "elementGaps": {
        "tight": "gap-2",
        "normal": "gap-4",
        "loose": "gap-6"
      },
      "rules": [
        "Use consistent spacing throughout similar components",
        "Mobile: prioritize vertical spacing, reduce horizontal padding",
        "Desktop: increase horizontal margins, maintain comfortable line lengths"
      ]
    },

    "components": {
      "buttons": {
        "primary": {
          "className": "rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors",
          "usage": "Main actions, form submissions"
        },
        "secondary": {
          "className": "rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors",
          "usage": "Cancel, back, alternative actions"
        },
        "success": {
          "className": "rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors",
          "usage": "Submit quiz, confirm positive action"
        },
        "danger": {
          "className": "rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-colors",
          "usage": "Delete, exit without saving - USE SPARINGLY"
        },
        "rules": [
          "Always use transition-colors for smooth hover states",
          "Maintain consistent padding (px-6 py-3 for normal, px-4 py-2 for small)",
          "Prefer primary black button unless specific context requires accent color"
        ]
      },

      "cards": {
        "standard": {
          "className": "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
          "usage": "Content containers, question cards, result cards"
        },
        "interactive": {
          "className": "rounded-lg border border-gray-200 bg-white p-6 hover:border-black hover:shadow-lg transition-all cursor-pointer",
          "usage": "Clickable subject cards, topic cards, selectable items"
        },
        "highlight": {
          "className": "rounded-lg border-2 border-black bg-white p-6",
          "usage": "Currently active selection"
        },
        "rules": [
          "Never stack multiple shadows",
          "Use subtle shadow-sm for elevation",
          "Border-black only for active/selected states",
          "Maintain consistent border-radius (rounded-lg)"
        ]
      },

      "icons": {
        "container": {
          "standard": "flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100",
          "large": "flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100",
          "usage": "Icon containers in cards and headers"
        },
        "standalone": {
          "className": "h-5 w-5 text-gray-900",
          "usage": "Inline icons, button icons"
        },
        "rules": [
          "Icons should be single color (no multi-color icons)",
          "Use lucide-react icon library",
          "Size: h-4 w-4 (small), h-5 w-5 (standard), h-6 w-6 (large)",
          "Always maintain aspect ratio"
        ]
      },

      "badges": {
        "default": {
          "className": "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900",
          "usage": "Tags, difficulty levels, status (neutral)"
        },
        "success": {
          "className": "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800",
          "usage": "Completed, passed, correct"
        },
        "warning": {
          "className": "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800",
          "usage": "In progress, needs attention"
        },
        "rules": [
          "Use full rounded corners (rounded-full)",
          "Keep text concise (1-2 words max)",
          "Prefer default gray badge over colored badges"
        ]
      },

      "progressIndicators": {
        "bar": {
          "container": "h-2 w-full overflow-hidden rounded-full bg-gray-200",
          "fill": "h-full bg-black transition-all",
          "usage": "Quiz progress, completion tracking"
        },
        "circular": {
          "description": "Use simple percentage text instead of complex circular progress",
          "alternative": "Display as 'X/Y completed' or 'X%' in text"
        },
        "rules": [
          "Keep progress bars simple and clean",
          "Use black fill for primary progress",
          "Show numerical representation alongside visual indicator"
        ]
      },

      "navigation": {
        "header": {
          "className": "border-b border-gray-200 bg-white",
          "innerContainer": "mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8",
          "usage": "Top navigation bar"
        },
        "backButton": {
          "className": "flex items-center gap-2 text-gray-600 hover:text-black transition-colors",
          "usage": "Back navigation"
        },
        "rules": [
          "Always include back navigation on detail pages",
          "Keep headers minimal - title and essential actions only",
          "Use border-bottom to separate from content"
        ]
      },

      "forms": {
        "input": {
          "className": "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none",
          "usage": "Text inputs, number inputs"
        },
        "select": {
          "className": "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none",
          "usage": "Dropdown selects"
        },
        "checkbox": {
          "className": "h-4 w-4 rounded text-blue-600 focus:ring-blue-500",
          "usage": "Multiple choice selections"
        },
        "radio": {
          "className": "h-4 w-4 text-blue-600 focus:ring-blue-500",
          "usage": "Single choice selections"
        },
        "rules": [
          "Always show focus states",
          "Use subtle blue for focus (only time blue is used)",
          "Maintain consistent padding across all input types"
        ]
      },

      "skeletons": {
        "base": {
          "className": "animate-pulse bg-gray-200 rounded",
          "usage": "Loading placeholders"
        },
        "variants": [
          "h-4 w-full (text line)",
          "h-8 w-3/4 (title)",
          "h-12 w-full rounded-lg (button)",
          "h-48 w-full rounded-lg (card)"
        ],
        "rules": [
          "Use skeletons for all data-fetching states",
          "Match skeleton dimensions to actual content",
          "Never show empty states during loading"
        ]
      }
    },

    "layoutPrinciples": {
      "maxWidth": "max-w-7xl (for main content), max-w-4xl (for reading content)",
      "centerContent": "mx-auto to center main containers",
      "mobileFirst": "Design for mobile, enhance for desktop",
      "whitespace": "Generous whitespace improves readability - don't be afraid of empty space",
      "hierarchy": "Use size, weight, and spacing to create clear visual hierarchy",
      "rules": [
        "Mobile: Full-width cards with px-4 padding",
        "Tablet: Grid layouts with gap-4",
        "Desktop: max-w-7xl container with gap-6"
      ]
    },

    "interactionPatterns": {
      "loading": {
        "pattern": "Show skeleton loaders matching content structure",
        "example": "Skeleton cards, bars, and text lines while fetching"
      },
      "navigation": {
        "pattern": "Navigate immediately, load data with skeletons",
        "example": "Click subject -> show subject page with skeletons -> data loads in"
      },
      "feedback": {
        "success": "Green checkmark icon, brief success message",
        "error": "Red icon, clear error message, recovery action",
        "warning": "Yellow icon, warning message, proceed/cancel options"
      },
      "confirmations": {
        "destructive": "Modal with clear warning, secondary and danger buttons",
        "standard": "In-line confirmation or simple modal"
      },
      "rules": [
        "Never block UI waiting for data - show skeletons",
        "Provide instant feedback for all user actions",
        "Keep modals focused and minimal - single purpose only"
      ]
    },

    "accessibilityRequirements": {
      "contrast": "Minimum WCAG AA contrast ratios (4.5:1 for normal text)",
      "focusStates": "All interactive elements must have visible focus indicators",
      "semanticHTML": "Use semantic HTML elements (button, nav, article, etc.)",
      "altText": "All icons must have accessible labels or aria-labels",
      "keyboardNav": "All functionality must be keyboard accessible"
    },

    "implementationGuidelines": {
      "doUse": [
        "Black for primary actions and important elements",
        "Gray variants for secondary content and backgrounds",
        "Accent colors ONLY for status indicators and critical highlights",
        "Consistent spacing and padding throughout",
        "Skeleton loaders during data fetching",
        "Smooth transitions (transition-colors, transition-all)",
        "Lucide React icons",
        "Simple, clean typography with clear hierarchy"
      ],
      "doNotUse": [
        "Multiple accent colors in same view (pick one if needed)",
        "Decorative gradients or shadows",
        "Animated or multi-color icons",
        "ALL CAPS text (except very short labels)",
        "Overly complex layouts",
        "Loading spinners without skeleton context",
        "Unnecessary borders or dividers"
      ]
    },

    "exampleScreens": {
      "subjectsPage": {
        "layout": "Grid of subject cards",
        "cardStyle": "Interactive card with icon container, title, description, and progress",
        "colorUsage": "Black icon background on hover, gray everywhere else",
        "spacing": "gap-4 for card grid"
      },
      "subjectDetailPage": {
        "layout": "Header with subject info, 'Test All Topics' button, grid of topic cards",
        "cardStyle": "Interactive topic cards with difficulty badge, completion icon (green check if completed)",
        "colorUsage": "Black button, green check for completed topics, gray everywhere else"
      },
      "topicDetailPage": {
        "layout": "Topic header, 'Quiz Me' button, learning content sections in cards",
        "cardStyle": "Content cards with clear typography hierarchy",
        "colorUsage": "Black button, green checks for key points, yellow/red for warnings/mistakes"
      },
      "quizSessionPage": {
        "layout": "Fixed header with progress, question card, answer options card, navigation buttons",
        "cardStyle": "Clean question and answer cards with clear separation",
        "colorUsage": "Black for navigation, green for answered status, progress bar in black"
      },
      "mockExamStartPage": {
        "layout": "Centered loading state with skeleton loaders",
        "cardStyle": "Info cards with icon placeholders and skeleton text",
        "colorUsage": "All gray during loading state"
      }
    }
  }
}

always add a load

# Previlace Design System

## Overview
Minimalist black and white design system emphasizing clarity, functionality, and professional aesthetics. Colors beyond black and white are used sparingly for critical status indicators only.

## Color Palette

### Primary Colors
- **Black**: `#000000` - Primary text, buttons, icons, backgrounds
- **White**: `#FFFFFF` - Primary background, button text
- **Gray Scale**:
  - Gray 50: `#F9FAFB` - Light backgrounds
  - Gray 100: `#F3F4F6` - Cards, subtle backgrounds
  - Gray 200: `#E5E7EB` - Borders, dividers
  - Gray 300: `#D1D5DB` - Hover states
  - Gray 400: `#9CA3AF` - Disabled states
  - Gray 500: `#6B7280` - Secondary text
  - Gray 600: `#4B5563` - Tertiary text
  - Gray 700: `#374151` - Dark text
  - Gray 800: `#1F2937` - Dark backgrounds
  - Gray 900: `#111827` - Darkest backgrounds

### Accent Colors (Minimal Use)
- **Green**: `#10B981` - Success, completion, checkmarks
- **Red**: `#EF4444` - Errors, warnings, critical actions
- **Blue**: `#3B82F6` - Links, information (rare use)
- **Yellow**: `#F59E0B` - Warnings (rare use)

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Font Sizes
- **Text XS**: `0.75rem` (12px) - Captions, meta information
- **Text SM**: `0.875rem` (14px) - Body text, descriptions
- **Text Base**: `1rem` (16px) - Default body text
- **Text LG**: `1.125rem` (18px) - Emphasized text
- **Text XL**: `1.25rem` (20px) - Card headers
- **Text 2XL**: `1.5rem` (24px) - Section headers
- **Text 3XL**: `1.875rem` (30px) - Page headers

### Font Weights
- **Normal**: `400` - Body text
- **Medium**: `500` - Emphasized text
- **Semibold**: `600` - Buttons, labels
- **Bold**: `700` - Headers, titles

## Spacing

### Padding & Margin Scale
```
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
```

## Border Radius

```
none: 0
sm: 0.125rem (2px)
DEFAULT: 0.25rem (4px)
md: 0.375rem (6px)
lg: 0.5rem (8px)
xl: 0.75rem (12px)
2xl: 1rem (16px)
full: 9999px
```

## Components

### Buttons

#### Primary Button
```jsx
<button className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800">
  Button Text
</button>
```

#### Secondary Button
```jsx
<button className="rounded-lg border border-black bg-white px-6 py-3 text-black hover:bg-gray-50">
  Button Text
</button>
```

#### Ghost Button
```jsx
<button className="rounded-lg bg-transparent px-6 py-3 text-black hover:bg-gray-100">
  Button Text
</button>
```

#### Icon Button
```jsx
<button className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800">
  <Icon className="h-5 w-5" />
</button>
```

### Cards

#### Basic Card
```jsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <h3 className="mb-2 text-lg font-bold text-gray-900">Card Title</h3>
  <p className="text-sm text-gray-600">Card description</p>
</div>
```

#### Interactive Card
```jsx
<button className="rounded-lg border border-gray-200 bg-white p-6 text-left hover:border-black hover:shadow-lg">
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
    <Icon className="h-6 w-6" />
  </div>
  <h3 className="mb-2 text-lg font-bold text-gray-900">Card Title</h3>
  <p className="text-sm text-gray-600">Card description</p>
</button>
```

#### Icon Card (Grid Item)
```jsx
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
    <Icon className="h-8 w-8 text-white" />
  </div>
  <h3 className="mb-1 text-base font-bold text-gray-900">Title</h3>
  <p className="text-xs text-gray-500">Day 19</p>
</div>
```

### Icons

#### Icon Sizes
```jsx
<Icon className="h-4 w-4" /> // Small
<Icon className="h-5 w-5" /> // Medium
<Icon className="h-6 w-6" /> // Large
<Icon className="h-8 w-8" /> // Extra Large
```

#### Icon Container
```jsx
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
  <Icon className="h-6 w-6 text-gray-900" />
</div>
```

#### Icon Circle
```jsx
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
  <Icon className="h-5 w-5 text-white" />
</div>
```

### Badges

#### Status Badge
```jsx
<span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
  Status
</span>
```

#### Difficulty Badge
```jsx
<span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
  beginner
</span>
```

#### Completion Badge
```jsx
<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
  <CheckCircle className="h-4 w-4 text-white" />
</div>
```

### Progress Indicators

#### Linear Progress
```jsx
<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
  <div className="h-full bg-black" style={{ width: "60%" }}></div>
</div>
```

#### Progress with Label
```jsx
<div>
  <div className="mb-1 flex items-center justify-between">
    <span className="text-sm text-gray-600">Progress</span>
    <span className="text-sm font-semibold text-gray-900">16/30 days</span>
  </div>
  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
    <div className="h-full bg-black" style={{ width: "53%" }}></div>
  </div>
</div>
```

#### Stats Display
```jsx
<div className="grid grid-cols-3 gap-4">
  <div>
    <div className="text-2xl font-bold text-gray-900">16</div>
    <div className="text-xs text-gray-600">Streak</div>
  </div>
  <div>
    <div className="text-2xl font-bold text-gray-900">16</div>
    <div className="text-xs text-gray-600">Check-Ins</div>
  </div>
  <div>
    <div className="text-2xl font-bold text-gray-900">100%</div>
    <div className="text-xs text-gray-600">Score</div>
  </div>
</div>
```

### Lists

#### Timeline List
```jsx
<div className="space-y-4">
  <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">Item Title</h4>
        <p className="text-sm text-gray-500">10:16 AM</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-400" />
  </button>
</div>
```

### Headers

#### Page Header
```jsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
  <p className="mt-2 text-gray-600">Page description</p>
</div>
```

#### Section Header
```jsx
<div className="mb-4">
  <h2 className="text-xl font-bold text-gray-900">Section Title</h2>
  <p className="mt-1 text-gray-600">Section description</p>
</div>
```

### Navigation

#### Back Button
```jsx
<button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black">
  <ArrowLeft className="h-4 w-4" />
  <span>Back</span>
</button>
```

#### Tab Navigation
```jsx
<div className="mb-6 flex items-center gap-2 border-b border-gray-200">
  <button className="border-b-2 border-black px-4 py-2 font-semibold text-black">
    Active Tab
  </button>
  <button className="border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-black">
    Inactive Tab
  </button>
</div>
```

### Grids

#### 2-Column Grid
```jsx
<div className="grid gap-4 sm:grid-cols-2">
  {/* Grid Items */}
</div>
```

#### 3-Column Grid
```jsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Grid Items */}
</div>
```

#### 4-Column Grid (For Small Items)
```jsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
  {/* Grid Items */}
</div>
```

### Forms

#### Input Field
```jsx
<div>
  <label className="mb-1 block text-sm font-medium text-gray-700">
    Label
  </label>
  <input
    type="text"
    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
    placeholder="Placeholder"
  />
</div>
```

#### Textarea
```jsx
<textarea
  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
  rows="4"
  placeholder="Placeholder"
/>
```

### Loading States

#### Spinner
```jsx
<div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
```

#### Full Page Loading
```jsx
<div className="flex min-h-screen items-center justify-center">
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
</div>
```

### Empty States

#### No Data
```jsx
<div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
  <p className="text-gray-600">No data available</p>
</div>
```

## Layout Patterns

### Container Widths
```jsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Full width container */}
</div>

<div className="mx-auto max-w-4xl px-4 sm:px-6">
  {/* Content container */}
</div>
```

### Page Layout
```jsx
<div className="min-h-screen bg-white">
  {/* Header */}
  <main className="mx-auto max-w-7xl p-4 sm:p-6">
    {/* Content */}
  </main>
</div>
```

## Interaction States

### Hover States
- Buttons: `hover:bg-gray-800` (dark) or `hover:bg-gray-50` (light)
- Cards: `hover:border-black hover:shadow-lg`
- Text: `hover:text-black`

### Focus States
- Inputs: `focus:border-black focus:ring-1 focus:ring-black`
- Buttons: `focus:outline-none focus:ring-2 focus:ring-offset-2`

### Disabled States
```jsx
<button 
  disabled 
  className="opacity-50 cursor-not-allowed"
>
  Disabled Button
</button>
```

## Best Practices

1. **Consistency**: Use the same component patterns throughout the app
2. **Hierarchy**: Establish clear visual hierarchy with font sizes and weights
3. **Spacing**: Maintain consistent spacing using the spacing scale
4. **Icons**: Use Lucide React icons consistently
5. **Accessibility**: Ensure proper contrast ratios and focus states
6. **Mobile First**: Design for mobile devices first, then scale up
7. **Minimal Color**: Reserve colors for status indicators and special actions
8. **Clean Layouts**: Use grids and flexbox for organized layouts
9. **Rounded Corners**: Use consistent border radius values
10. **Shadows**: Use shadows sparingly for elevation

## Animation

### Transitions
```jsx
<div className="transition-all duration-200">
  {/* Animated content */}
</div>
```

### Hover Transitions
```jsx
<button className="transition-colors duration-200 hover:bg-gray-800">
  Button
</button>
```

## Responsive Design

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile First Examples
```jsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>

<div className="p-4 sm:p-6 lg:p-8">
  {/* Responsive padding */}
</div>
```

## Do Not Use
- Multiple bright colors in a single view
- Excessive gradients
- Overly decorative elements
- Heavy shadows
- Complex animations
- Alert.alert (doesn't work)

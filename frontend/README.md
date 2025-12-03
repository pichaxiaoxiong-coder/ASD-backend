# 启明星 Web 前端（`frontend/`）

本目录为 ASD-APP 的主 Web 前端工程，通过 HTTP 调用仓库根目录下 `backend/` 的 FastAPI 接口：

- `backend/`：情绪识别、社交解码、干预计划等后端服务
- `frontend/`：家长/儿童端 Web 界面（本目录）
- `src/`：早期 uni-app 原型，仅作参考/移动端 Demo

## 运行方式（与根 README 保持一致）

```bash
cd frontend
npm install           # 或 pnpm i / yarn
npm run dev           # http://localhost:3000
```

- 构建产物：`npm run build`（输出到 `frontend/dist/`，已在 `.gitignore`，可随时重建）
- 预览构建：`npm run preview`
- 默认后端地址通过 `VITE_API_BASE_URL` 配置（开发环境通常为 `http://localhost:8000`）

---

## Features

- 🎨 Calming, warm, low-stimulation design optimized for families with autistic children
- 📱 Fully responsive mobile-first design
- ♿ Accessibility-focused with 48px touch targets and proper contrast
- 🔐 Login and registration flows with form validation
- 🎭 Smooth animations and transitions (0.2s duration)
- 🌟 Adorable star mascot character

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Single-File Components** - Clean, maintainable code structure

## Getting Started

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

\`\`\`bash
npm run build
\`\`\`

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── App.vue                      # Main app component with mode toggle
├── components/
│   ├── LoginForm.vue           # Login form with phone/password
│   └── RegistrationForm.vue    # Registration with parent/child tabs
├── styles/
│   └── main.css                # Global styles and Tailwind config
├── main.ts                     # App entry point
└── vite-env.d.ts              # TypeScript declarations

public/
└── images/
    └── star-mascot.png         # Star mascot image
\`\`\`

## Design Specifications

### Color Palette
- **Primary Blue**: `rgb(59,130,246)` - Warm, calming blue
- **Text Gray**: `rgb(75,85,99)` - Soft, readable gray
- **Background**: Gradient from `rgb(255,252,248)` to `rgb(250,248,245)`
- **Input Focus**: `rgb(250,250,255)` - Subtle blue tint

### Typography
- **Font Family**: Geist (sans-serif)
- **Title**: 24px, semibold
- **Subtitle**: 18px, normal
- **Labels**: 16px, medium
- **Inputs**: 16px, normal

### Spacing
- **Vertical spacing**: 24px between form fields
- **Input height**: 48px (touch-friendly)
- **Input padding**: 14px vertical, 16px horizontal
- **Border radius**: 8px for inputs and buttons

### Interactions
- **Focus**: 0.2s transition, 1.5px blue border
- **Button press**: scale(0.98) transform
- **Countdown button**: Gradient from warm blue to light purple
- **Password strength**: 3-level indicator (red → yellow → green)

## Key Features

### Login Form
- Phone number input with +86 country code
- Password field with show/hide toggle
- "Forgot password" link
- Social login options (WeChat, QQ)
- Loading state with animated dots

### Registration Form
- **Tabbed interface**: Parent info and child info
- **Parent fields**: Name, phone, verification code, relationship, password
- **Child fields**: Name, birth date, ASD diagnosis status
- **Verification code**: 60-second countdown with color gradient
- **Password strength**: Visual indicator
- **Agreement checkbox**: Terms and privacy policy
- **Form validation**: All fields required before submission

## Accessibility

- Minimum 48px touch targets for all interactive elements
- Proper color contrast ratios
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## License

Private - For ASD rehabilitation app use only

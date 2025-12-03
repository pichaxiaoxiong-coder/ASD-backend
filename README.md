# ASD-APP 项目运行指南

该仓库包含三套主要代码（前后端分离）：

- `backend/`：FastAPI 后端（MongoDB、情绪识别、社交解码、干预计划、康复监测等服务）
- `frontend/`：Web 前端（基于 **Vite + Vue 3** 的主应用，并补充了一组 **React/Next 风格的 TSX 页面** 用于进度监测、情绪游戏等新功能）
- `src/`：原始 uni-app 原型（保留做移动端 Demo，不是当前主线）

前端 `frontend/` 通过 HTTP 调用 `backend/`，两者之间通过 `VITE_API_BASE_URL` 等环境变量解耦。下面先给出项目整体技术栈，然后列出各部分的常用运行方式，避免在多入口项目中误用命令。

---

## 技术栈总览

- **后端（backend）**
  - **语言 & 框架**：Python 3、FastAPI、Uvicorn
  - **数据存储**：MongoDB（通过 `motor` 异步驱动）、ChromaDB 用于向量存储 / 语义检索
  - **配置与工具**：`pydantic` 配置管理和数据模型、`python-dotenv` 环境变量管理
  - **认证与权限**：基于 JWT 的登录鉴权（`PyJWT`、`passlib[bcrypt]`）、角色/管理员权限控制
  - **情绪 / NLP 能力**：
    - 情绪识别与情绪日记接口（`/emotion/*`）
    - 社交解码与行为分类（`/decoder/*`、`/scene-similarity`）
    - 干预计划生成与模板管理（`/intervention/*`）
    - 进度记录与康复监测（`/progress/*`、`/recovery/*`）
    - 中文文本处理：`jieba` 分词
    - 通过 `openai`、`langchain` 预留大模型调用与链式推理能力
  - **实时能力与监控**：WebSocket 实时情绪服务、`prometheus-fastapi-instrumentator` 指标采集
  - **架构**：分层的 `routers/`（路由）、`services/`（业务逻辑）、`models/`（数据模型）、`core/`（配置与工具）结构

- **前端（frontend）**
  - **构建工具**：Vite
  - **主框架（Vue 应用）**：
    - Vue 3 + TypeScript
    - 路由与状态：`vue-router`、`pinia`
    - UI：`vuetify` 组件库
    - 单文件组件（SFC）结构，主要位于 `frontend/src`
  - **新一代页面（TSX 应用层）**：
    - 在 `frontend/*/page.tsx` 中使用 **React + TypeScript** + `lucide-react` 图标库
    - 使用类似 Next.js App Router 的目录结构与 `“use client”` 组件组织形式
    - Tailwind / 原子类风格的样式（见 `globals.css` / `styles/globals.css`）
    - shadcn 风格的 UI 组件（`components/ui/*`），用于卡片、进度条、Badge、表单等
    - 图表与数据可视化：`recharts` + 自定义 `ChartContainer` 等封装组件（用于康复监测、成长曲线等）
    - 典型页面：
      - `frontend/companion/page.tsx`：对话陪伴页面（语音/文本、图片上传等交互）
      - `frontend/emotion-diary/page.tsx`：情绪日记
      - `frontend/emotion-game/page.tsx`：表情识别小游戏（摄像头 + 微表情检测）
      - `frontend/progress/page.tsx`：学习进度概览
      - `frontend/recovery-monitoring/page.tsx`：康复进度监测与统计
  - **API 调用层**：
    - 统一封装在 `frontend/src/lib/api-client.ts`
    - 封装情绪、进度、干预、康复监测等所有后端 REST 接口，统一错误处理与 Token 处理
    - 提供类型安全的 `apiClient.xxx` 调用方式，前端页面通过它与后端交互

- **脚本、提示词与运行支撑**
  - 根目录 `package.json`：提供 `npm run dev`（代理到 `frontend/`）以及 uni-app 相关脚本
  - Windows 启动脚本：`start_backend.bat`、`start_frontend.bat`、`start_all.bat`
  - Docker：`docker-compose.yml` 一键启动后端与 MongoDB
  - **提示词工程目录**：
    - `backend/prompt/`：按情绪/意图分类的 JSON 提示模板，用于情绪回应、干预建议等大模型调用
    - `promt/`：你上传的自定义提示词工程（可用于扩展 LLM 提示、实验不同的对话风格/策略）

---

## 后端（FastAPI）

```powershell
cd backend
python -m venv .venv     # 若首次运行
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API 文档：http://localhost:8000/docs
- 也可直接双击根目录的 `start_backend.bat` 或 `start_all.bat`
- 如果使用 Docker，可在根目录执行 `docker-compose up -d`

## Web 前端（Vite/Next in `frontend/`）

```powershell
cd frontend
npm install        # 或 pnpm i / yarn
npm run dev        # 默认 http://localhost:3000
```

- 构建产物：`npm run build`（输出到 `frontend/dist/`，已在 `.gitignore`，可随时重建）
- 预览产物：`npm run preview`
- 如需指向本地后端，请在 `frontend/.env.local` 或命令行设置 `VITE_API_BASE_URL=http://localhost:8000`
- `start_frontend.bat` / `start_all.bat` 也可直接开启

## uni-app 原型（`src/`）

该目录保留最初的 Uni-App 客户端，可按需运行：

```powershell
npm install
npm run dev:h5      # 或 dev:mp-weixin / build:h5 等
```

> 若团队只维护新的 Vite 前端，可忽略本目录；如需删除请先确认不再使用。

---

## 常见脚本

| 脚本 | 说明 |
| ---- | ---- |
| `start_backend.bat` | 创建/激活虚拟环境并启动 FastAPI |
| `start_frontend.bat` | 安装依赖并启动前端 Dev Server |
| `start_all.bat` | 同时启动前后端（两个终端窗口） |

---

## 目录小结

```
backend/           FastAPI 服务
backend/prompt/    内置情绪/干预提示词模板（JSON）
frontend/          Vite/Next Web 前端（原 export/）
src/               Uni-App 原型
promt/             自定义大模型提示词工程
docker-compose.yml 本地一键启动（后端+Mongo）
start_*.bat        Windows 启动脚本
```

如需新增子项目或脚本，请同步更新本 README，保持入口一致。欢迎根据团队习惯补充更多运行说明。


# 项目部署指南 (Dianping Clone)

本项目基于 **React + Vite** 前端框架和 **Supabase** 后端服务，推荐使用 **Vercel** 进行前端托管。

## 1. 准备工作

在开始部署前，请确保您已经拥有以下账号：
- [GitHub](https://github.com) 账号（用于代码托管）
- [Vercel](https://vercel.com) 账号（用于前端部署）
- [Supabase](https://supabase.com) 账号（用于后端数据库和认证服务）

## 2. 环境变量配置

在部署时，需要配置以下环境变量。请登录 Supabase 控制台获取这些信息：

| 变量名 | 描述 | 获取方式 |
|--------|------|----------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | Supabase -> Project Settings -> API -> Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名公钥 | Supabase -> Project Settings -> API -> anon public |

> ⚠️ 注意：切勿在前端项目中暴露 `service_role` 密钥！仅需配置 `anon` 密钥。

## 3. 部署步骤 (使用 Vercel)

### 方式一：通过 GitHub 自动部署 (推荐)

1.  **推送代码**：将本地代码提交并推送到 GitHub 仓库。
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <your-github-repo-url>
    git push -u origin main
    ```

2.  **导入项目**：
    - 登录 Vercel 控制台。
    - 点击 **"Add New..."** -> **"Project"**。
    - 选择并导入您的 GitHub 仓库。

3.  **配置构建设置**：
    - Framework Preset: 选择 **Vite** (通常会自动识别)。
    - Root Directory: `./` (默认)。
    - Build Command: `npm run build` (默认)。
    - Output Directory: `dist` (默认)。

4.  **配置环境变量**：
    - 展开 **"Environment Variables"** 选项卡。
    - 添加第 2 步中准备的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。

5.  **开始部署**：
    - 点击 **"Deploy"** 按钮。
    - 等待约 1 分钟，部署完成后即可访问生成的 `*.vercel.app` 域名。

### 方式二：使用 Vercel CLI 本地部署

如果您不想使用 GitHub，也可以直接在本地使用命令行部署：

1.  安装 Vercel CLI：
    ```bash
    npm i -g vercel
    ```

2.  登录并部署：
    ```bash
    vercel login
    vercel --prod
    ```
    (按照提示选择项目名称，并在询问环境变量设置时选择 'y' 并输入值，或者在 Vercel 网页控制台设置)

## 4. 常见问题排查

- **页面刷新 404**：
  - 请确保项目根目录存在 `vercel.json` 文件，并且配置了 rewrite 规则指向 `index.html`。本项目已包含此文件。

- **登录/注册失败**：
  - 检查环境变量是否正确配置。
  - 检查 Supabase Auth 设置是否允许 Phone/Email 登录。
  - 检查 Supabase 数据库表和 RLS 策略是否已应用（参考 `supabase/migrations` 目录）。

- **跨域 (CORS) 错误**：
  - 通常 Supabase 默认允许所有域访问 API，但如果在 Supabase 设置中限制了域名，请将 Vercel 生成的域名添加到允许列表中。

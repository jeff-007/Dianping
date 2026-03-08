
# 阿里云服务器项目部署方案 (Dianping Clone) - Ubuntu 22.04 LTS 版

本文档将指导您如何将 **Dianping Clone** 项目部署到阿里云 ECS 服务器 (推荐系统: **Ubuntu 22.04 LTS**)，并配置域名访问 (`www.shanmao.site`)。

---

## 1. 准备工作

### 1.1 服务器要求
- **阿里云 ECS 实例**:
  - 操作系统: **Ubuntu 22.04.5 LTS** (当前最新稳定版)
  - 规格: 2 vCPU, 4GB RAM (最低配置建议)
  - 公网 IP: 必须具备

### 1.2 域名准备
- **域名**: `www.shanmao.site`
- **解析设置**: 在阿里云 DNS 控制台添加一条 `A` 记录，将 `www` 和 `@` 解析到您的 ECS 公网 IP 地址。

---

## 2. 服务器环境配置

### 2.1 连接服务器
使用 SSH 连接到您的服务器（推荐使用密钥对）：
```bash
# 如果使用密钥对
ssh -i /path/to/your-key.pem root@<您的服务器IP>

# 如果使用密码
ssh root@<您的服务器IP>
```

### 2.2 安装必要软件 (Ubuntu 22.04)
为了简化操作，您可以直接运行项目根目录下的 `setup_alibaba.sh` 脚本，或者手动执行以下步骤：

**手动安装步骤 (Ubuntu 22.04):**

1.  **更新系统**:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **安装 Node.js (v20 LTS)**:
    Node.js 18 仍处于维护期，但 **Node.js 20 (LTS)** 是目前的长期支持版本，性能更好且支持时间更长，强烈推荐使用。
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # 验证版本
    node -v  # 应输出 v20.x.x
    npm -v
    ```

3.  **安装 MongoDB (v7.0)**:
    Ubuntu 22.04 (Jammy) 官方支持 MongoDB 7.0。
    ```bash
    # 导入公钥
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # 创建列表文件
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # 更新并安装
    sudo apt update
    sudo apt install -y mongodb-org
    
    # 启动并设置开机自启
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```

4.  **安装 Nginx**:
    ```bash
    sudo apt install -y nginx
    ```

5.  **安装 PM2 (进程管理工具)**:
    ```bash
    sudo npm install -g pm2
    ```

6.  **安装 Git**:
    ```bash
    sudo apt install -y git
    ```

---

## 3. 部署项目代码

### 3.1 上传代码
您可以通过 Git 克隆代码库，或者将本地代码压缩包上传到服务器。

**推荐目录**: `/var/www/dianping`

```bash
# 创建目录
sudo mkdir -p /var/www/dianping
sudo chown -R $USER:$USER /var/www/dianping

# 上传代码 (示例使用 scp，在本地执行)
# scp -r ./* root@<您的服务器IP>:/var/www/dianping
```

### 3.2 安装依赖与构建

进入项目目录并安装依赖：

```bash
cd /var/www/dianping

# 安装根目录依赖 (开发依赖用于构建前端)
npm install

# 安装服务端依赖
cd server
npm install
cd ..

# 构建前端应用 (生成 dist 目录)
npm run build
```

---

## 4. 启动后端服务 (Node.js + PM2)

我们使用 PM2 来管理 Node.js 后端进程，确保服务崩溃自动重启。

1.  **检查配置文件**: 确保项目根目录下有 `ecosystem.config.js`。
2.  **启动服务**:
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    ```
    *(运行 `pm2 startup` 后，请按照屏幕提示执行显示的命令以配置开机自启)*

    *注意*: 如果需要修改数据库连接字符串或 JWT 密钥，请编辑 `ecosystem.config.js` 中的 `env` 部分。

---

## 5. 配置 Web 服务 (Nginx)

Nginx 将作为反向代理服务器，处理静态文件请求并转发 API 请求到后端。

1.  **复制配置文件**:
    ```bash
    sudo cp nginx.conf /etc/nginx/sites-available/dianping
    ```

2.  **启用站点**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/dianping /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default  # 移除默认配置
    ```

3.  **测试并重载 Nginx**:
    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```

---

## 6. 配置 SSL 证书 (HTTPS)

使用 Certbot 自动申请和配置 Let's Encrypt 免费 SSL 证书。

1.  **安装 Certbot**:
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    ```

2.  **获取证书**:
    ```bash
    sudo certbot --nginx -d www.shanmao.site -d shanmao.site
    ```
    按照提示输入邮箱并同意协议。Certbot 会自动修改 Nginx 配置以启用 HTTPS。

---

## 7. 验证与测试

部署完成后，请进行以下验证：

1.  **访问网站**: 打开浏览器访问 `https://www.shanmao.site`。
2.  **功能测试**:
    *   **注册**: 尝试使用手机号注册新用户。
    *   **登录**: 使用注册的账号登录。
    *   **浏览**: 查看商家列表是否加载正常 (需确保 MongoDB 中有数据)。

3.  **API 测试**:
    在浏览器控制台或 Postman 中测试 API：
    ```bash
    curl https://www.shanmao.site/api/auth/me
    ```

---

## 8. 日志监控与维护

- **查看后端日志**:
    ```bash
    pm2 logs dianping-server
    ```
- **查看 Nginx 日志**:
    ```bash
    tail -f /var/log/nginx/access.log
    tail -f /var/log/nginx/error.log
    ```
- **重启服务**:
    ```bash
    pm2 restart dianping-server
    sudo systemctl restart nginx
    ```

---

## 9. 常见问题排查

- **502 Bad Gateway**: 通常表示后端服务未启动。检查 `pm2 status` 和 `pm2 logs`。
- **404 Not Found (API)**: 检查 Nginx 配置中的 `proxy_pass` 是否正确指向 `http://localhost:5000`。
- **数据库连接失败**: 确保 MongoDB 服务已启动 (`sudo systemctl status mongod`) 且连接字符串正确。

祝您部署顺利！

# 🚀 Pre-Deployment Checklist

完成以下检查项后即可部署到 Vercel。

---

## ✅ 代码检查

- [x] **删除临时/调试文档**
  - ✅ 删除了: API_SETUP.md, FIX_APPLIED.md, RECURSION_FIX.md, FINAL_FIX.md
  - ✅ 删除了: 简单使用说明.md, QUICK_START.md, SETUP.md, 重新启动说明.md, 环境变量配置说明.md, EMAIL_TEMPLATE_NOTES.md
  - ✅ 保留了: README.md, DEPLOYMENT.md, public/email-assets/README.md

- [x] **没有硬编码的 localhost 链接**
  - ✅ `api/sendCard.ts` 使用 `PUBLIC_URL` 环境变量
  - ✅ README.md 已更新部署说明
  - ✅ 代码中的 localhost 仅作为后备使用

- [x] **Node.js 版本配置**
  - ✅ `package.json` 指定 `"engines": { "node": "20.x" }`
  - ✅ `.nvmrc` 文件已创建（指定 Node.js 20）
  - ✅ `vercel.json` 使用现代 runtime `nodejs20.x`

- [x] **环境变量配置**
  - ✅ `.env.example` 文件已创建（模板）
  - ✅ `.env` 和 `.env.local` 在 `.gitignore` 中
  - ✅ 本地 `.env` 包含正确的配置

- [x] **邮件资源**
  - ✅ `public/email-assets/email-bg.jpg` 已上传（49KB，JPEG 格式）
  - ✅ 图片格式正确（不是 WebP）
  - ✅ 图片可在本地访问

---

## 🔧 Vercel 配置检查

### 需要在 Vercel Dashboard 中设置的环境变量

访问：https://vercel.com/your-username/christmas-tree-jade/settings/environment-variables

添加以下变量（适用于 Production, Preview, Development）：

| 变量名 | 值 | 状态 |
|--------|-----|------|
| `RESEND_API_KEY` | `your_resend_api_key` | ⚠️ **待添加** |
| `PUBLIC_URL` | `https://christmas-tree-jade.vercel.app` | ⚠️ **待添加** |

**或使用 Vercel CLI：**

```bash
# 添加 RESEND_API_KEY
vercel env add RESEND_API_KEY
# 选择：Production, Preview, Development (全选)
# 输入：your_resend_api_key

# 添加 PUBLIC_URL
vercel env add PUBLIC_URL
# 选择：Production, Preview, Development (全选)
# 输入：https://christmas-tree-jade.vercel.app
```

---

## 📋 部署前最终检查

### 1. 文件检查

```bash
# 检查关键文件是否存在
ls -lh public/email-assets/email-bg.jpg  # 应该显示约 49KB
cat .env.example                          # 应该显示模板
ls README.md DEPLOYMENT.md                # 应该存在
```

### 2. Git 状态检查

```bash
# 确保 .env 文件不会被提交
git status | grep .env
# 应该没有输出（.env 被 .gitignore 忽略）

# 查看将要提交的文件
git status
```

### 3. 本地测试

```bash
# 启动本地服务器
npm start

# 在浏览器中测试
# 1. 访问 http://localhost:3000
# 2. 发送测试邮件到你的邮箱
# 3. 检查邮件：
#    - 背景图片是否显示？
#    - 文字颜色是否正确？（#4A3A2F）
#    - 邮件中的链接是否指向 https://christmas-tree-jade.vercel.app？
#    - 点击链接是否能正常打开卡片？
```

---

## 🚀 准备部署

一切检查通过后，执行以下命令：

```bash
# 1. 暂存所有更改
git add .

# 2. 提交
git commit -m "feat: email functionality with production-ready configuration

- Add email sending via Resend API
- Implement warm neutral color palette (#4A3A2F)
- Configure dynamic PUBLIC_URL for email links
- Add minimalist email template with parchment background
- Convert background image to JPEG format
- Clean up documentation
"

# 3. 推送到 GitHub
git push

# 4. 使用 Vercel CLI 部署（可选）
vercel --prod
```

---

## ✅ 部署后验证

### 1. 访问生产环境

打开：https://christmas-tree-jade.vercel.app

### 2. 测试功能

- [ ] 表单页面正常加载
- [ ] 可以发送邮件
- [ ] 收到的邮件中：
  - [ ] 背景图片显示正常
  - [ ] 文字可读（#4A3A2F 颜色）
  - [ ] 链接指向正确的域名
  - [ ] 点击链接能打开卡片页面
- [ ] 卡片页面正常工作：
  - [ ] 手势控制正常（如果有摄像头）
  - [ ] 自动播放模式正常（如果没有摄像头）
  - [ ] 个性化消息显示正确

### 3. 验证背景图片可访问

```bash
curl -I https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg
# 应该返回: HTTP/2 200
```

---

## 🐛 常见问题

### 邮件背景不显示？

- 检查 `public/email-assets/email-bg.jpg` 是否已推送到 Git
- 验证图片是否可访问：https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg
- 确认图片格式是 JPEG（不是 WebP）

### 邮件链接指向错误的域名？

- 检查 Vercel 环境变量 `PUBLIC_URL` 是否正确设置
- 重新部署后发送新邮件测试

### 发送邮件失败？

- 检查 Vercel 环境变量 `RESEND_API_KEY` 是否正确设置
- 验证 Resend API key 是否有效
- 检查 Vercel 函数日志

---

## 📞 需要帮助？

查看详细文档：
- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署指南
- [README.md](README.md) - 项目概述和快速开始

祝部署顺利！🎄✨

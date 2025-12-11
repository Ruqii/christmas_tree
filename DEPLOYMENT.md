# 部署指南

## 快速部署到 Vercel

### 1. 在 Vercel 上配置环境变量

访问 Vercel Dashboard：https://vercel.com

进入项目设置：**Settings → Environment Variables**

添加以下环境变量（适用于 Production, Preview, Development）：

| 变量名 | 值 |
|--------|-----|
| `RESEND_API_KEY` | `re_hqCZBywC_HBRvgaTTUffwTDSDv5MBqBHn` |
| `PUBLIC_URL` | `https://christmas-tree-jade.vercel.app` |

### 2. 部署代码

```bash
# 提交代码
git add .
git commit -m "feat: add email functionality with Vercel deployment"
git push

# 或直接使用 Vercel CLI
vercel --prod
```

### 3. 验证部署

访问：https://christmas-tree-jade.vercel.app

测试：
1. 填写表单发送邮件
2. 检查收到的邮件
3. 点击邮件中的链接，应该跳转到 https://christmas-tree-jade.vercel.app/card?...

---

## 本地测试（使用生产环境链接）

即使在本地开发，邮件中的链接也会指向 Vercel 部署地址。

### 1. 确保环境变量已配置

`.env` 和 `.env.local` 中都应该有：
```env
RESEND_API_KEY=re_hqCZBywC_HBRvgaTTUffwTDSDv5MBqBHn
PUBLIC_URL=https://christmas-tree-jade.vercel.app
```

### 2. 启动本地服务器

```bash
npm start
```

### 3. 测试发送邮件

访问：http://localhost:3000

发送测试邮件后，邮件中的链接将指向：
- ✅ `https://christmas-tree-jade.vercel.app/card?...`（正确）
- ❌ ~~`http://localhost:3000/card?...`~~（不会出现）

---

## 环境变量说明

### PUBLIC_URL 的作用

在 `api/sendCard.ts` 中，`PUBLIC_URL` 环境变量用于：
1. **卡片链接**：邮件中的 "Open Your Christmas Card" 按钮链接
2. **背景图片**：邮件背景图片 URL

```typescript
const baseUrl = process.env.PUBLIC_URL || (() => {
  const host = req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
})();

const cardUrl = `${baseUrl}/card?...`;
const bgImageUrl = `${baseUrl}/email-assets/email-bg.jpg`;
```

**优先级**：
1. 如果设置了 `PUBLIC_URL` → 使用环境变量
2. 否则 → 自动从请求头获取域名

---

## 故障排除

### 邮件链接还是指向 localhost？

1. 检查 `.env` 文件是否包含 `PUBLIC_URL`
2. 确认重启了服务器（`npm start`）
3. 发送**新邮件**测试（旧邮件不会更新）

### Vercel 部署后背景图片不显示？

1. 确认 `public/email-assets/email-bg.jpg` 已提交到 Git
2. 检查文件格式是否为真正的 JPG（不是 WebP）
3. 访问 `https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg` 验证可访问

### 生产环境链接不对？

确认 Vercel 环境变量已正确设置：
```bash
vercel env ls
```

如果没有，添加：
```bash
vercel env add PUBLIC_URL
# 输入：https://christmas-tree-jade.vercel.app
# 选择：Production, Preview, Development (全选)
```

---

## 更新部署域名

如果你使用自定义域名（例如 `magic-tree.ruqilabs.com`）：

### 1. 更新环境变量

**.env** 和 **.env.local**：
```env
PUBLIC_URL=https://magic-tree.ruqilabs.com
```

**Vercel 环境变量**：
更新 `PUBLIC_URL` 为新域名

### 2. 重新部署

```bash
git add .
git commit -m "Update public URL to custom domain"
git push
```

### 3. 测试

发送新邮件，验证链接指向新域名。

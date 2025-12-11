# Email Assets Directory

## Purpose

This directory contains static assets used in email templates.

## Required Files

### `email-bg.jpg`

**Specifications:**
- Size: 1200px × 1600px (or similar 3:4 ratio)
- Format: JPG (optimized)
- File size: < 200KB
- Style: Subtle, festive, warm background

**What it should look like:**
- Dark or muted base (so white text card stands out)
- Subtle festive elements (snowflakes, winter textures, soft bokeh)
- NOT busy or high-contrast
- Premium, elegant feel

**Where to find/create:**
1. **Create custom**: Use Canva, Photoshop with festive overlays
2. **Stock photos**: Unsplash, Pexels ("christmas texture dark", "winter background subtle")
3. **Generate**: Use AI image generation with prompt: "elegant dark festive christmas background, subtle snowflakes, premium texture, minimal"

## Current Status

- ✅ Background image uploaded (`email-bg.jpg`, 49KB)
- ✅ URL configured in `api/sendCard.ts` (uses `PUBLIC_URL` environment variable)
- ✅ Converted to proper JPEG format (email-client compatible)

## Deployment

The background image URL is automatically determined by the `PUBLIC_URL` environment variable in `api/sendCard.ts`.

**Production URL:** `https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg`

## Verify Image Accessibility

After deployment, verify the image is accessible:
```bash
curl -I https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg
# Should return: HTTP/1.1 200 OK
```

## Notes

- Images in this directory are publicly accessible (they need to be for email)
- Optimize images for web before uploading
- Use absolute URLs in email templates (relative URLs don't work in emails)

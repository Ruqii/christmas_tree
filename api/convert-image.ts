import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import fs from 'fs';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Image Conversion Request ===');
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    console.log('Parsing form data...');
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
          if (err) {
            console.error('Formidable parsing error:', err);
            reject(err);
          } else {
            console.log('Form parsed successfully');
            resolve([fields, files]);
          }
        });
      }
    );

    // Get uploaded file
    const fileArray = files.photo;
    console.log('Files received:', Object.keys(files));
    if (!fileArray || fileArray.length === 0) {
      console.error('No file uploaded in photo field');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    console.log('File info:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
      path: file.filepath
    });

    // Read file buffer
    console.log('Reading file buffer...');
    const fileBuffer = await fs.promises.readFile(file.filepath);
    console.log('File buffer read, size:', fileBuffer.length);

    console.log('Processing image:', {
      originalName: file.originalFilename,
      mimeType: file.mimetype,
      size: file.size,
    });

    // Process image with Sharp
    console.log('Starting Sharp processing...');
    let processedBuffer: Buffer;
    let finalContentType = 'image/jpeg';

    try {
      processedBuffer = await sharp(fileBuffer)
        .rotate() // Auto-rotate based on EXIF
        .resize(1024, 1024, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          mozjpeg: true, // Better compression
          force: true, // Force JPEG output
        })
        .toColorspace('srgb') // Ensure RGB color space
        .toBuffer();
      console.log('Sharp processing complete');
    } catch (sharpError: any) {
      console.warn('Sharp processing failed (likely local dev without libheif):', sharpError.message);
      console.warn('Falling back to original file - THIS WILL WORK ON VERCEL');

      // Fallback for local dev: use original file
      // This won't work well for HEIC but allows local testing with regular JPG/PNG
      processedBuffer = fileBuffer;
      finalContentType = file.mimetype || 'image/jpeg';

      // Try a simpler Sharp operation that doesn't require HEIC support
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        try {
          processedBuffer = await sharp(fileBuffer)
            .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();
          finalContentType = file.mimetype;
          console.log('Fallback: Resized without format conversion');
        } catch {
          // Use original if even resize fails
          console.log('Fallback: Using original file');
        }
      }
    }

    console.log('Image processed:', {
      originalSize: file.size,
      processedSize: processedBuffer.length,
      reduction: `${(((file.size - processedBuffer.length) / file.size) * 100).toFixed(1)}%`,
    });

    // Generate unique filename with appropriate extension
    const extension = finalContentType === 'image/png' ? 'png' : 'jpg';
    const filename = `${randomUUID()}.${extension}`;
    const storagePath = `photos/${filename}`;

    console.log('Uploading to Supabase Storage:', storagePath);
    console.log('Content-Type:', finalContentType);
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ecard-photos')
      .upload(storagePath, processedBuffer, {
        contentType: finalContentType,
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        error: 'Failed to upload image to storage',
        details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ecard-photos')
      .getPublicUrl(storagePath);

    console.log('Upload successful:', urlData.publicUrl);

    // Clean up temp file
    await fs.promises.unlink(file.filepath).catch(() => {});

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      filename: filename,
      size: processedBuffer.length,
    });
  } catch (error: any) {
    console.error('=== Image conversion error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Failed to process image',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

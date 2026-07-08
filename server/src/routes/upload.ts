/**
 * Upload API 路由
 *
 * 处理文件上传
 */

import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const router = Router();

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 修复中文文件名编码问题
    // Multer 默认使用 latin1 编码，需要转换为 utf8
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // 替换不安全的文件名字符，但保留中文
    const safeName = originalName.replace(/[<>:"/\\|?*]/g, '-');

    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

/**
 * POST /api/upload
 *
 * 上传单个文件
 */
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件上传' });
    }

    res.json({
      path: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '上传文件时出错'
    });
  }
});

/**
 * POST /api/upload/multiple
 *
 * 上传多个文件
 */
router.post('/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: '没有文件上传' });
    }

    const files = req.files.map(file => ({
      path: file.path,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ files });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '上传文件时出错'
    });
  }
});

export default router;

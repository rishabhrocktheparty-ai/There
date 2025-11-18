import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { authenticate, AuthedRequest } from '../middleware/authMiddleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/voice', authenticate, upload.single('file'), (req: AuthedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.post('/avatar', authenticate, upload.single('file'), (req: AuthedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export const uploadRouter = router;

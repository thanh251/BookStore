import express from 'express';
// Xóa đuôi .ts ở cuối đường dẫn
import { handleChat } from '../controllers/chat.controller'; 

const router = express.Router();

router.post('/', handleChat);

export default router;
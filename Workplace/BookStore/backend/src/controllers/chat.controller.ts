import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import pool from '../config/db';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Lấy dữ liệu thật từ DB để inject vào system prompt
const getStoreContext = async (): Promise<string> => {
    const [categories] = await pool.query(
        'SELECT name FROM category ORDER BY id'
    ) as any;

    const [products] = await pool.query(
        `SELECT name, author, price, discount, publisher, yearPublishing, totalBuy
         FROM product
         WHERE shop = 1
         ORDER BY totalBuy DESC
         LIMIT 60`
    ) as any;

    const catList = categories
        .map((c: any) => c.name)
        .join(', ');

    const bookList = products
        .map((p: any) => {
            const finalPrice = p.discount > 0
                ? Math.round(p.price * (1 - p.discount / 100))
                : p.price;
            const priceStr = new Intl.NumberFormat('vi-VN').format(finalPrice) + 'đ';
            const discountStr = p.discount > 0 ? ` (giảm ${p.discount}%)` : '';
            return `• ${p.name} — Tác giả: ${p.author} — Giá: ${priceStr}${discountStr} — NXB: ${p.publisher} (${p.yearPublishing})`;
        })
        .join('\n');

    return `
DANH MỤC SÁCH HIỆN CÓ: ${catList}

DANH SÁCH SÁCH (sắp xếp theo bán chạy):
${bookList}
    `.trim();
};

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, chatHistory } = req.body;

        if (!message) {
            res.status(400).json({ message: 'Vui lòng nhập tin nhắn' });
            return;
        }

        // Lấy dữ liệu store từ DB
        const storeContext = await getStoreContext();

        const systemPrompt = {
            role: 'system',
            content: `Bạn là trợ lý tư vấn sách của BOOKSTORE — một cửa hàng sách trực tuyến.

NHIỆM VỤ CỦA BẠN:
- Tư vấn, gợi ý sách dựa trên dữ liệu thực tế bên dưới
- Hỗ trợ khách hàng tìm sách theo tác giả, thể loại, giá cả
- Hướng dẫn đặt hàng, thanh toán, vận chuyển
- Trả lời ngắn gọn, thân thiện, dùng tiếng Việt

GIỚI HẠN QUAN TRỌNG:
- CHỈ trả lời về sách và dịch vụ có trong store
- Nếu hỏi sách KHÔNG có trong danh sách bên dưới → trả lời "Hiện tại cửa hàng chưa có đầu sách này"  
- Nếu hỏi chủ đề KHÔNG liên quan đến sách/mua hàng → lịch sự từ chối và hướng về tư vấn sách
- KHÔNG bịa thông tin sách, giá, tác giả ngoài dữ liệu được cung cấp

CHÍNH SÁCH CỬA HÀNG:
- Miễn phí vận chuyển đơn trên 200.000đ
- Giao hàng tiêu chuẩn: 15.000đ — Giao nhanh: 50.000đ
- Đổi trả trong 30 ngày
- Thanh toán an toàn SSL

DỮ LIỆU CỬA HÀNG:
${storeContext}`
        };

        const messages = [
            systemPrompt,
            ...(chatHistory || []),
            { role: 'user', content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages as any,
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,   // giảm xuống để bám sát dữ liệu hơn
            max_tokens: 600,
        });

        const aiResponse =
            chatCompletion.choices[0]?.message?.content ||
            'Xin lỗi, tôi đang gặp chút sự cố. Bạn có thể hỏi lại được không?';

        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        console.error('Groq API Error:', error);
        res.status(500).json({ message: 'Lỗi server khi gọi AI' });
    }
};
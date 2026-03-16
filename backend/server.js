const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password : 'password',
    port: 5432
});

app.get('/api/posts', async (req, res) => {
    try{
        // 페이지네이션 및 검색
        const page = parseInt(req.query.page || 1);
        const search = req.query.search || '';
        const limit = 3;
        const offset = (page - 1) * limit;

        const postsQuery = `
            SELECT * FROM board_posts
            WHERE title ILIKE $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const postsResult = await pool.query(postsQuery, [`%${search}%`, limit, offset]);

        // 전체 개수
        const countQuery = `SELECT COUNT(*) FROM board_posts WHERE title ILIKE $1`;
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            posts: postsResult.rows,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount: totalCount
        });

    } catch (err){
        console.error(err);
        res.status(500).json({message: "데이터 조회 실패", error: err.message});
    }
});

// 글쓰기 API
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content } = req.body; // 편지봉투(body)에서 제목과 내용 꺼내기

        // DB에 저장하는 쿼리
        const query = `
            INSERT INTO board_posts (title, content, created_at)
            VALUES ($1, $2, NOW())
            RETURNING *`; // 방금 저장된 데이터를 다시 보여달라는 뜻

        const result = await pool.query(query, [title, content]);

        res.status(201).json(result.rows[0]); // 성공하면 저장된 데이터 응답
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "글쓰기 실패", error: err.message });
    }
});

// 게시글 상세 조회 API
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `SELECT * FROM board_posts WHERE id = $1`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 상세 조회 실패", error: err.message });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
        }

        const query = `
            UPDATE board_posts
            SET title = $1, content = $2
            WHERE id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [title, content, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        res.json(result.rows[0]);
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 수정 실패", error: err.message });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM board_posts WHERE id = $1`;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 삭제되었습니다." });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 삭제 실패", error: err.message });
    }
});

app.listen(8080, () => {
    console.log("백엔드 서버가 8080번 포트에서 실행 중~~")
})
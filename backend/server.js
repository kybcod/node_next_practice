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
        const postsResult = await pool.query(postsQuery, [`%${search}`, limit, offset]);

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















app.listen(8080, () => {
    console.log("백엔드 서버가 8080번 포트에서 실행 중")
})
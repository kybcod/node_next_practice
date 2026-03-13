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

app.get('/test', async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: "DB 연결 성공",
            dbTime: result.rows[0].now
        });
    } catch (err){
        console.error(err);
        res.status(500).json({message: "DB 연결 실패", error: err.message});
    }
});

app.listen(8080, () => {
    console.log("백엔드 서버가 8080번 포트에서 실행 중")
})
// 필요로하는 정보들은 먼저 import 한 뒤 서버를 실행하는 파일

import 'dotenv/config';
import './db';
import './models/Video';
import './models/User';
import app from './server';

const PORT = 4000;

const handleListening = () => console.log(`✅ Server listening on port ${PORT}`);
app.listen(PORT, handleListening);
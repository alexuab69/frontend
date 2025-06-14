import { fileURLToPath } from 'url';
import cors from 'cors';
import path from 'path';
import express from 'express';
import Game from './game.js'; // Import Game function
import { WebSocketServer } from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8081;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

let connectedClient = null;
const sendWebSocketMessage = (type, data) => {
    if (connectedClient && connectedClient.readyState === 1) {
        connectedClient.send(JSON.stringify({ type, data }));
    }
};

const game = Game(sendWebSocketMessage);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected!');
    connectedClient = ws;
    ws.on('close', () => {
        console.log('WebSocket client disconnected!');
        connectedClient = null;
    });
});


// Endpoint: /cast_line
app.get('/cast_line', (req, res) => {
    const result = game.castLine();
    if (result) {
        res.status(400).json({ errorCode: result });
    } else {
        res.sendStatus(200);
    }
});

// Endpoint: /wait_for_bite
app.get('/wait_for_bite', (req, res) => {
    game.waitForBite()
        .then(() => {
            res.sendStatus(200);
        })
        .catch((errorCode) => {
            res.status(400).json({ errorCode });
        });
});

// Endpoint: /reel_in
app.get('/reel_in', (req, res) => {
    const result = game.reelIn();
    if (result.errorCode) {
        res.status(400).json(result);
    } else if (result.difficulty) {
        res.status(200).json(result);
    }
});

// Endpoint: /get_mini_game_info
app.get('/get_mini_game_info', (req, res) => {
    const result = game.getCatchingMiniGameInfo();
    res.status(200).json(result);
});

// Endpoint: /move_catch_bar_up
app.get('/move_catch_bar_up', (req, res) => {
    game.updateCatchBarDirection("up");
    res.sendStatus(200);
});

// Endpoint: /stop_moving_catch_bar_up
app.get('/stop_moving_catch_bar_up', (req, res) => {
    game.updateCatchBarDirection(null);
    res.sendStatus(200);
});



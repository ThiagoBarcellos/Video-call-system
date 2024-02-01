import express, {Application} from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io';

class App {
    private app: Application;
    private http: http.Server;
    private io: Server;

    constructor(){
        this.app = express();
        this.http = new http.Server(this.app);
        this.io = new Server(this.http, {
            cors:{
                origin: '*',
            },
        });
    }

    public listen(){
        this.http.listen(3333, () => {
            console.log("server is running on port 3333");
        })
    }

    public listenSocket(){
        this.io.of('/streams').on('connection', this.socketEvents)
    }

    private socketEvents(socket: Socket){
        socket.on('subscribe', (data) => {
            socket.join(data.roomId)

            socket.on('chat', (data) => {
                socket.broadcast.to(data.roomId).emit('chat', {
                    message: data.message,
                    username: data.username,
                    time: data.time
                });
            });
        });
    }
}

export {App};
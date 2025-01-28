const express=require("express");
const socket=require("socket.io");
const {Chess}=require("chess.js");
const path = require("path");
const { title } = require("process");
const app=express();

const http=require("http").createServer(app);
const io=socket(http);

const chess=new Chess();
let players={};
let currPlayer="white";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
});


io.on("connection",function(uniquesocket){
    console.log("connected");
    
    if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole","white");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole","black");
    }
    else{
        uniquesocket.emit("playerRole","spectator");
    }

    uniquesocket.on("disconnect",function(){
        console.log("disconnected");
        if(players.white===uniquesocket.id){
            players.white=null;
        }
        else if(players.black===uniquesocket.id){
            players.black=null;
        }
    });

    uniquesocket.on("move",function(data){
        try{
            if(chess.turn()==="white" && players.white!==uniquesocket.id) return;   
            if(chess.turn()==="black" && players.black!==uniquesocket.id) return;
            
            const result=chess.move(data);
            if(result){
                currPlayer=chess.turn();
                io.emit("move",data);
                io.emit("chessboardstate",chess.fen());       
            }
            else{
                console.log("invalid move : "+data);
                uniquesocket.emit("invalidMove",data);
            }
        } 
        catch(e){
            console.log(e);
        }
    });
});

http.listen(3000,()=>{
    console.log("listening on port 3000");
});







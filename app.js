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
let currPlayer="w";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
});


io.on("connection",function(uniquesocket){
    console.log("connected");
    
    if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("playerRole","spectatorRole");
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

    uniquesocket.on("move",function(move){
        try{
            if(chess.turn()==="white" && players.white!==uniquesocket.id) return;   
            if(chess.turn()==="black" && players.black!==uniquesocket.id) return;
            
            const result=chess.move(move);
            if(result){
                currPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());       
            }
            else{
                console.log("invalid move : "+move);
                uniquesocket.emit("invalidMove",move);
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







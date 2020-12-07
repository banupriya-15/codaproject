//ES6
const express= require("express");
const bodyParser = require("body-parser")
const mongoose= require("mongoose");
const socketio = require("socket.io")
const http = require("http")
const Team = require("./models/TeamModel");
const Match = require("./models/MatchModel");
const { post } = require("jquery");
const { Socket } = require("dgram");
const app= express()

const server = http.Server(app);

// middleware

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});



app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.get("",(request,response)=>
{
    response.send("hi");
})

//CREATE TEAM
app.post("/create",(req,res)=>{

    detail=req.body;
    console.log(detail);
    team=new Team({
        name : detail.name,
        createdAt : new Date().toISOString(),
    });
    team.save().then((data)=>{
        res.status(200).json(data);
    }).catch((error)=>{
        console.log(error);
        res.status(500).send(error);
    })

})

//MATCH TEAM

app.post("/match",(req,res)=>{

    detail=req.body;
    //console.log(detail);
    Team.findOne({name:detail.team1}).then((data1)=>{
        //console.log(data1);
         Team.findOne({name: detail.team2}).then((data2)=>{
            //console.log(data2);
            match = new Match({
                team1: req.body.team1,
                team2: req.body.team2,
                result: req.body.result
            });

            match.save().then((data) => {
                //console.log(data);
                if(data.result === "1"){
                    console.log("team1");
                    Team.updateOne({name : data.team1}, {
                        $inc: {
                            score: 3,
                            wins : 1
                        }
                    }).then((data3) => {
                            Team.updateOne({name : data.team2}, {
                                $inc:{
                                    lose : 1
                                }
                            }).then((data7)=>{
                                res.status(200).send(data7);
                            }).catch(err =>{
                                res.status(500).send(err);
                            })
                           
                    }).catch(err =>{
                        res.status(500).send(err);
                    });
                }else if(data.result === "2"){
                    console.log("team2");
                    Team.updateOne({name : data.team2}, {
                        $inc: {
                            score: 3,
                            wins : 1
                        }
                    }).then((data4) => {
                            Team.updateOne({name : data.team1},{
                                $inc: {
                                    lose : 1
                                }
                            }).then((data8)=>{
                                res.status(200).send(data8);
                            }).catch(err =>{
                                res.status(500).send(err);
                            })
                           
                    }).catch(err =>{
                        res.status(500).send(err);
                    });
                }else if(data.result === "0"){
                    console.log("tie");
                    Team.updateOne({name : data.team2}, {
                        $inc: {
                            score: 1,
                            tie : 1
                        }
                    }).then((data5) => {
                        Team.updateOne({name : data.team1}, {
                            $inc: {
                                score: 1,
                                tie : 1
                            }
                        }).then((data6) => {
                                res.status(200).send(data6);
                        }).catch(err =>{
                            res.status(500).send(err);
                        });
                    }).catch(err =>{
                        res.status(500).send(err);
                    });

                }
                 
            }).catch(err => {
                res.status(500).send(err);
            })
         }).catch(err => {
            res.status(404).send("Team2 does not exist")
        })
    }).catch(err =>{
      res.status(404).send("Team1 does not exist")
    });

    demo({msg:"any"});
    
})

app.get("/board/:option", (req, res) => {
    if (req.params.option === "score"){
        Team.find().sort({score: -1}).then((data) => {
            res.status(200).send(data)
        }).catch(err => {
            res.status(500).send(err)
        })
    } else if(req.params.option === "name") {
        Team.find().sort({name: 1}).then((data) => {
            res.status(200).send(data)
        }).catch(err => {
            res.status(500).send(err)
        })
    }
})


mongoose.connect("mongodb://localhost:27017/codadb",{ useNewUrlParser :true , useUnifiedTopology: true },()=>{
    console.log("db connected");

})


server.listen(3000,()=>{
    console.log("server connected")
});

const io = socketio(server)
function demo(data) {
    io.on('connection', (socket)=>{
        socket.emit("score",data)
    })
}

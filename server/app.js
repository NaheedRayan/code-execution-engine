const express = require('express');
const amqp = require('amqplib/callback_api');
// const amqp = require('amqp-connection-manager');
const redis = require('redis');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const compression = require('compression');


// for https 
const https = require('https')
const path = require('path');
const fs = require('fs');

// const bodyParser = require('body-parser')
const app = express()

const port1 = 9090   //for http
const port2 = 8080   //for https

const cors = require('cors');
const {
    fdatasync
} = require('fs');
app.use(cors())

// middleware
app.use(express.json());
//for gzip compression
app.use(compression({
    level :7,
    threshold:30*1000 
}))

// for redis
const client = redis.createClient({
    host: 'redis-server',
    port: 6379
})

client.on('error', (err) => {
    console.log("Error " + err)
});

function random(size) {
    return require("crypto").randomBytes(size).toString('hex');
}

app.get('/' , (req,res)=>{
    res.status(200).send("Hello from Titan-Engine");
})

app.get('/redirect' , (req,res)=>{
    res.redirect("https://titan-engine.herokuapp.com/");
})

app.get('/stats', (req, res) => {
    var os = require('os-utils'); //for os details

    let cpu_usage
    let cpu_free

    os.cpuUsage(function (v) {
        cpu_usage = v * 100;
        os.cpuFree(function (v) {
            cpu_free = v * 100;
            data = {

                "10": `  ............................................................................  `,
                "11": `   #████████████████████████████████████████████████████████████████████████#   `,
                "12": `    #██████████████████████████████████████████████████████████████████████#    `,
                "13": `      .................................  .................................      `,
                "14": `        #█████████████████████████████.  .█████████████████████████████#        `,
                "15": `           #██████████████████████████.  .██████████████████████████#           `,
                "16": `             ,,,,,,,,,,,,,,,,,,,██████.  .██████,,,,,,,,,,,,,,,,,,,             `,
                "17": `                               .██████.  .██████.                               `,
                "18": `                               .██████.  .██████.                               `,
                "19": `                               .██████.  .██████.                               `,
                "20": `                               .██████.  .██████.                               `,
                "21": `                               .██████.  .██████.                               `,
                "22": `                               .██████.  .██████.                               `,
                "23": `                               .██████.  .██████.                               `,
                "24": `                               .██████.  .██████.                               `,
                "25": `                               .██████.  .██████.                               `,
                "26": `                               .██████.  .██████.                               `,
                "27": `                               .██████.  .██████.                               `,
                "28": `                               .██████.  .██████.                               `,
                "29": `                                 #████.  .████#                                 `,
                "30": `                                   #██.  .██#                                   `,
                "31": `                                     #.  .#                                     `,
                "32": `                                                                                `,
                "33": `                                                                                `,
                "34": `                    ████████╗██╗████████╗ █████╗ ███╗   ██╗                     `,
                "35": `                    ╚══██╔══╝██║╚══██╔══╝██╔══██╗████╗  ██║                     `,
                "36": `                       ██║   ██║   ██║   ███████║██╔██╗ ██║                     `,
                "37": `                       ██║   ██║   ██║   ██╔══██║██║╚██╗██║                     `,
                "38": `                       ██║   ██║   ██║   ██║  ██║██║ ╚████║                     `,
                "39": `                       ╚═╝   ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝                     `,
                "40": `                           Titan Code Execution Engine                          `,
                "OS platform": os.platform(),
                "CPU usage (%)": cpu_usage,
                "CPU free  (%)": cpu_free,
                "CPU count": os.cpuCount(),
                "Free memory (mb)": os.freemem(),
                "Total memory (mb)": os.totalmem(),
                "Free memory (%)": os.freememPercentage() * 100,
                "OS Uptime (hour)": os.sysUptime() / 3600,
                "Avg Load (15min)": os.loadavg(15) * 100
            }
            console.log(data);
            // for printing json beautifully in response 
            res.set({
                'Content-Type': 'application/json; charset=utf-8'
            })
            res.status(200).send(JSON.stringify(data, undefined, ' '));
        })
    })


    // res.send('Hello World from the server.');
    console.log("A get request has been made");
})

app.post('/submit', (req, res) => {
    // res.send('Yea i got ur message');
    console.log("A post request has been made");
    // let data_src = req.body.src;
    // let data_src = req.body ;
    data_src = {
        "src": req.body.src,
        "stdin": req.body.stdin,
        "lang": req.body.lang,
        "timeout": req.body.timeout,
        "filename": "Test" + random(10)
    }
    // console.log(data_src);

    if (req.body.src && req.body.lang && parseInt(req.body.timeout) <= 5) {

        if (data_src) {
            // sending data with the help of emitter
            eventEmitter.emit('message_received', data_src);
        }

        res.status(202).send(req.protocol + '://' + req.get('host') + "/results/" + data_src.filename);
        // res.status(202).send('http://localhost:8080/results/' + data_src.filename);
    } else {

        console.log("Invalid Request has been made")
        let result = {
            'output': "Invalid Request",
            'status': "Invalid Request",
        }
        client.setex(data_src.filename.toString(), 300, JSON.stringify(result));



        // res.status(202).send('http://localhost:8080/results/' + data_src.filename);
        res.status(202).send(req.protocol + '://' + req.get('host') + "/results/" + data_src.filename);

    }
})

app.get("/results/:filename", (req, res) => {

    let filename = req.params.filename;
    client.get(filename, (err, status) => {
        if (status == null) {
            res.status(202).json({status:"Queued"});
        } else if (status == '{"status":"Processing"}') {
            res.status(202).json({status:"Processing"}); 
        }else if(status == '{"status":"Runtime Error"}'){
            res.status(202).json({status:"Runtime Error"});
        }else
            res.status(200).json(JSON.parse(status));
    });
})

app.listen(port1, () => {
    console.log(`Server app listening at http://localhost:${port1}`)//port : 9090
})


const sslServer = https.createServer({
    key :fs.readFileSync(path.join(__dirname , 'cert' , 'key.pem')),
    cert:fs.readFileSync(path.join(__dirname , 'cert' , 'cert.pem')),  
} , app)


sslServer.listen(port2, () => {
    console.log(`Server app listening at https://localhost:${port2}`)//port : 8080
})

// for the rabbitmq
amqp.connect('amqp://rabbitmq:5672', function (error0, connection) {
    if (error0) {
        console.log('An error occured while connecting rabbitmq');
        console.log(error0);
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            console.log('An error occured while creating channel');
            console.log(error1);

        }
        var queue = 'task_queue';
        // var msg = 'The message number is ' +num ;

        channel.assertQueue(queue, {
            durable: false
        });
        console.log('------------------------------------------------Connected server----------------------------------------------------')
        eventEmitter.on("message_received", (data) => {
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
            console.log("[x] Sent: %s file(%s) has been sent", data.lang, data.filename);

        })

    });
    // setTimeout(function () {
    //     connection.close();
    //     process.exit(0);
    // }, 500);
});
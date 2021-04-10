const express = require('express');
const amqp = require('amqplib/callback_api');
// const amqp = require('amqp-connection-manager');
const redis = require('redis');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();


// const bodyParser = require('body-parser')
const app = express()
const port = 8080

// middleware
app.use(express.json());


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

app.get('/', (req, res) => {
    res.send('Hello World from the server.');
    console.log("A get request has been made");
})

app.post('/submit', (req, res) => {
    // res.send('Yea i got ur message');
    console.log("A post request has been made");
    // let data_src = req.body.src;
    // let data_src = req.body ;
    data_src = {
        "src": req.body.src , 
        "stdin":req.body.stdin,
        "lang" : req.body.lang, 
        "timeout": req.body.timeout, 
        "filename": random(10) 
    }
    console.log(data_src);
    // console.log(data_src);
    
    if (data_src) {
        // sending data with the help of emitter
        eventEmitter.emit('message_received', data_src);
    }

    res.status(202).send('http://localhost:8080/results/'+data_src.filename);
    
})

app.get("/results/:filename", (req,res)=>{
    
    let filename = req.params.filename;
    client.get(filename, (err, status) => {
        if (status==null) 
        {
            res.status(202).send('{"status":"Queued"}');
        }
        else if(status=='{"status":"Processing"}')
        {
            res.status(202).send('{"status":"Processing"}');
        }
        else 
            res.status(200).send(status);
    });
})

app.listen(port, () => {
    console.log(`Server app listening at http://localhost:${port}`)
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
            console.log("[x] Sent: %s", data);
            
        })

    });
    // setTimeout(function () {
    //     connection.close();
    //     process.exit(0);
    // }, 500);
});
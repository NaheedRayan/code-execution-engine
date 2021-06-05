const amqp = require('amqplib/callback_api');
const redis = require('redis');
const fs = require('fs');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

client.on('error', (err) => {
    console.log("Error " + err)
});

const extensions = {
    "cpp": "cpp",
    "c": "c",
    "java": "java",
    "python3": "py",
    "openJDK-8":"java"
};


function runCode(json_msg, channel, msg) {
    // console.log('message acknowledged')
    // channel.ack(msg);

    client.setex(json_msg.filename.toString(), 300, '{"status":"Processing"}');

    let command = "python3 run.py " + json_msg.filename + " " + extensions[json_msg.lang] + " " + json_msg.timeout;


    // writing the input.txt file
    fs.writeFile("./temp/input.txt", json_msg.stdin.toString(), function (err1) {
        if (err1){
            console.log("in err1")
            console.log(err1)
            deletingTempFiles()
        }else {
            // writing the source file
            fs.writeFile("./temp/" + json_msg.filename + "." + extensions[json_msg.lang], json_msg.src, function (err2) {
                if (err2){
                    console.log("in err2")
                    console.log(err2)
                    deletingTempFiles()
                }
                else {

                    const {exec} = require('child_process');
                    // executing the command
                    exec(command, (err3, stdout, stderr) => {
                        if (err3) {
                            console.log("in err3")
                            console.log(err3);
                            
                            channel.ack(msg);
                            client.setex(json_msg.filename.toString(), 300, '{"status":"Runtime Error"}');
                        
                            deletingTempFiles()
                        } else {

                            console.log(`-------------------------${json_msg.lang}-------------------------------`)

                            // for showing file size
                            let stats = fs.statSync("./temp/output.txt")
                            let fileSizeInBytes = stats.size;
                            // Convert the file size to megabytes (optional)
                            let fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
                            console.log(`-------------------filesize: ${fileSizeInBytes} bytes------------------`)
                            console.log(`-------------------filesize: ${fileSizeInMegabytes} mb-----------------`)

                            // console.log(stdout);
                            // console.log(stderr);
                            fs.readFile("./temp/output.txt", "utf8", function (err4, contents) {

                                if (err4)
                                    console.log(err4);
                                else {
                                    
                                    let result = {
                                        'output': contents,
                                        'status':stdout,
                                        'stderr':stderr,
                                        'submission_id': json_msg.filename
                                    }

                                    contents = null;

                                    // console.log(result);
                                    client.setex(json_msg.filename.toString(), 300, JSON.stringify(result));

                                    console.log('message acknowledged')
                                    channel.ack(msg);

                                    // now we have to delete the files inside the temp folder
                                    deletingTempFiles()
                                    
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}


function deletingTempFiles(){
    // now we have to delete the files inside the temp folder
    fs.readdir('temp', (err5, files) => {
        if (err5) console.log(err5);
        else {
            for (let i in files) {
                fs.unlink('./temp/' + files[i], (err6) => {
                    if (err6) {
                        console.log(err6);
                    } else {
                        console.log( "DELETED files -> "+files[i]);
                    }
                })
            }
        }
    })

}



function createFiles(json_msg, channel, msg) {
    // console.log('message acknowledged')
    // channel.ack(msg);

    fs.writeFile("./temp/" + json_msg.filename + "." + extensions[json_msg.lang], "" , function (err) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('Source file created');
            fs.writeFile("./temp/input.txt", "", function (err1) {
                if (err1)
                    console.log(err1);
                else {
                    console.log('Input file created')
                    fs.writeFile("./temp/output.txt", "", function (err2) {
                        if (err2)
                            console.log(err2);
                        else {
                            console.log('Output file created')

                            // now running the files
                            runCode(json_msg, channel, msg);
                        }
                    })
                }
            })
        }
    })
}

// for rabbitmq
amqp.connect("amqp://rabbitmq:5672", (error0, connection) => {
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

        channel.assertQueue(queue, {
            durable: false
        });



        channel.prefetch(1);
        console.log("[*] Waiting for messages in %s. To exit press CTRL+C", queue);


        channel.consume(queue, function (msg) {
            console.log('[x] Worker 01');

            // converting message to string and then to json object
            json_msg = JSON.parse(msg.content.toString())
            // console.log("[x] Received %s", json_msg.src);
            console.log("[x] Received %s", json_msg.filename);

            // when we will receive a message we will create files
            createFiles(json_msg, channel, msg);

        }, {
            // automatic acknowledgment mode,
            // see https://www.rabbitmq.com/confirms.html for details
            noAck: false
        });


    });
})
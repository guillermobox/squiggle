const yaml = require('js-yaml');
const fs = require('fs');
const express = require('express')
var tmp = require('tmp');
const app = express()
var mime = require('mime-types');
var program = require('commander');

program
  .version('1.0.0')
  .usage('squiggle <nugget ...>');

program.parse(process.argv);

const { exec } = require('child_process');
var format = require("string-template");
require('express-ws')(app);

class Nugget {
    constructor(path) {
        this.path = path;
        this.data = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
        this.data.path = path;
        this.inputs = {};
        for (var i in this.data.input)
            this.inputs[this.data.input[i].name] = this.data.input[i];
        this.outputs = {};
        for (var i in this.data.output)
            this.outputs[this.data.output[i].name] = this.data.output[i];
    }
    run(input, tag, ws) {
        var filesToRemove = [];
        
        /* create required input files */
        for (var name in input) {
            /* for path, I want to create a file */
            if (this.inputs[name].parser === 'path') {
                var tmpobj = tmp.fileSync();
                var n = input[name].indexOf('base64');
                var data;
                if (n != -1) {
                    data = Buffer.from(input[name].slice(n+7), 'base64');
                } else {
                    data = Buffer.from(input[name]);
                }
                fs.writeSync(tmpobj.fd, data);
                var filepath = tmpobj.name;
                input[name] = filepath;
                //filesToRemove.push(filepath);
            }
        }

        var cmd = format(this.data.application.commandline, input);

        const proc = exec(cmd, {encoding:'buffer'}, (error, stdout, stderr) => {
            var response = {};
            response.commandline = cmd;
            response.tag = tag;
            response.stdout = stdout.toString();
            response.stderr = stderr.toString();
            response.error = error;
            //response.output = { outputimage: 'data:image/png;base64,' + base64 };
            response.output = {};

            for (var out in this.outputs) {
                var output = this.outputs[out];
                if (output.type === 'stdout') {
                    if (output.parser === 'int')
                        response.output[output.name] = parseInt(response.stdout);
                    else if (output.parser == 'image') {
                        var m = output.mimetype;
                        var b64 = stdout.toString('base64');
                        response.output[output.name] = 'data:' + m + ';base64,' + b64;
                    }
                }else if (output.type === 'file') {
                    var path = format(output.path, input);
                    var data = fs.readFileSync(path);
                    fs.unlinkSync(path);
                    var b64 = Buffer(data).toString('base64');
                    var m = mime.lookup(path);                
                    response.output[output.name] = 'data:' + m + ';base64,' + b64;
                }
            }
            filesToRemove.forEach(element => {
                fs.unlinkSync(element);
            });
            ws.send(JSON.stringify(response));
        });

    }
}

var nuggets = program.args.map((e) => new Nugget(e));
app.use(express.static('static/dist'))

app.get('/nugget/', (request, response) => {
    response.json(nuggets.map(element => {
        return element.data
    }));
})

app.ws('/nugget/', function (ws, req) {
    ws.on('message', function (msg) {
        msg = JSON.parse(msg);
        /* unpack the data from the input message */
        var nuggetPath = msg.path;

        var input = {};
        msg.input.forEach(element => {
            input[element.name] = element.value;
        });
        /* try to find the nugget */
        var mynugget = null;
        for (var i in nuggets) {
            if (nuggets[i].path == nuggetPath)
                mynugget = nuggets[i];
        }

        if (mynugget === null) {
            return;
        } else {
            mynugget.run(input, msg.tag, ws);
        }
    });
});

app.listen(3000)

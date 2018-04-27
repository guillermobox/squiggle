import yaml
import string
import subprocess
import tempfile

import sys

class Argument(object):
    def __init__(self, yamlsection):
        self.name = yamlsection['name']
        self.description = yamlsection['description']
        self.parser = yamlsection['parser']
        if yamlsection['type'] == 'file':
            self.path = yamlsection['path']

class Nugget(object):
    def __init__(self, path):
        data = open(path, "r").read()
        self.yaml = yaml.load(data)
        self.title = self.yaml['application']['name']
        self.description = self.yaml['application']['description']
        self.cmd = self.yaml['application']['commandline']

        self.input = []
        self.output = []

        for input in self.yaml['input']:
            self.input.append(Argument(input))

        for input in self.yaml['output']:
            self.output.append(Argument(input))

    def run(self, args):
        cmdline = string.Template(self.cmd).substitute(args)
        out = subprocess.check_output(cmdline, shell=True)

        if self.output[0].parser == 'image':
            filepath = string.Template(self.output[0].path).substitute(args)
            import base64
            f = open(filepath, 'r').read()
            return 'data:image/png;base64,' + base64.b64encode(f)
        else:
            return str(out)

nugget = Nugget(sys.argv[1])
print nugget

import tornado.web
import tornado.ioloop
import tornado.httpserver

class Handler(tornado.web.RequestHandler):
    def get(self):
        self.write("WOP")

class NuggetHandler(tornado.web.RequestHandler):
    def get(self, path):
        self.render("./static/index.html", nugget=nugget)

    def post(self, path):
        inputdict = dict()
        for input in nugget.input:
            if input.parser != 'path':
                value = self.get_argument(input.name)
                inputdict[input.name] = value
            else:
                value = self.request.files[input.name][0]['body']
                t = tempfile.NamedTemporaryFile(delete=False)
                t.write(value)
                t.close()
                inputdict[input.name] = t.name

        self.write(nugget.run(inputdict))

app = tornado.web.Application(
[
    (r'/static/(.*)', tornado.web.StaticFileHandler, dict(path='./static/')),
    (r'/app/(.*)', NuggetHandler),
    (r'/(.*)', tornado.web.StaticFileHandler, dict(path='./static/',
        default_filename="index.html")),
], debug=True)

httpserver = tornado.httpserver.HTTPServer(app)
httpserver.listen(8080)
tornado.ioloop.IOLoop.current().start()

#


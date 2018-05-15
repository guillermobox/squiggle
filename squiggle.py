import yaml
import string
import subprocess
import tempfile
import json
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
        self.validate()

        self.title = self.yaml['application']['name']
        self.description = self.yaml['application']['description']
        self.cmd = self.yaml['application']['commandline']

        self.input = []
        self.output = []

        for input in self.yaml['input']:
            self.input.append(Argument(input))

        for input in self.yaml['output']:
            self.output.append(Argument(input))

    def validate(self):
        import schema

        sh = schema.Schema(dict(
            application={
                'name': str,
                'description': str,
                'commandline': str,
                schema.Optional('icon', default=None): str,
            },
            input=[
                {
                    'type': str,
                    'name': str,
                    'description': str,
                    'parser': str,
                    schema.Optional('default'): object,
                    schema.Optional('mimetype'): str,
                }],
            output=[
                {
                    'type': str,
                    'name': str,
                    'description': str,
                    'parser': str,
                    schema.Optional('mimetype'): str,
                    schema.Optional('path'): str,
                }],
        )
        )

        self.yaml = sh.validate(self.yaml)

        return True

    def run(self, args):
        cmdline = string.Template(self.cmd).substitute(args)
        out = subprocess.check_output(cmdline, shell=True)

        if self.output[0].parser == 'image':
            filepath = string.Template(self.output[0].path).substitute(args)
            import base64
            f = open(filepath, 'rb').read()
            return 'data:image/png;base64,' + base64.b64encode(f).decode('utf-8')
        else:
            return str(out)


class NuggetCollection(object):
    def __init__(self):
        self.nuggets = dict()
        for filename in 'quantization.yaml application.yaml'.split():
            self.nuggets[filename] = Nugget(filename)


db = NuggetCollection()

import tornado.web
import tornado.ioloop
import tornado.httpserver

class NuggetHandler(tornado.web.RequestHandler):
    def get(self, nuggetid):
        if not nuggetid in db.nuggets:
            self.clear()
            self.set_status(404)
            return
        self.write(db.nuggets[nuggetid].yaml)

    # def post(self, path):
    #     inputdict = dict()
    #     for input in nugget.input:
    #         if input.parser != 'path':
    #             value = self.get_argument(input.name)
    #             inputdict[input.name] = value
    #         else:
    #             value = self.request.files[input.name][0]['body']
    #             t = tempfile.NamedTemporaryFile(delete=False)
    #             t.write(value)
    #             t.close()
    #             inputdict[input.name] = t.name

    #     self.write(nugget.run(inputdict))


class NuggetListHandler(tornado.web.RequestHandler):
    def get(self):
        urls = [n.yaml for n in db.nuggets.values()]
        self.write(json.dumps(urls))


app = tornado.web.Application(
    [
        (r'/static/(.*)', tornado.web.StaticFileHandler, dict(path='./static/dist/')),
        tornado.web.url(r'/nugget/(.+)', NuggetHandler, name='nugget'),
        (r'/nugget/', NuggetListHandler),
        (r'/(.*)', tornado.web.StaticFileHandler, dict(path='./static/dist/',
                                                       default_filename="index.html")),
    ], debug=True)

httpserver = tornado.httpserver.HTTPServer(app)
httpserver.listen(8080)
tornado.ioloop.IOLoop.current().start()

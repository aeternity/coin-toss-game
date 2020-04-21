To start the application with nodeservice and node pointed at the remote server, do:

```
$ npm install -g @angular/cli

$ npm install

$ ng serve
```

You can serve the application pointed pointing the channel service and node to be hosted at 
```
 SC_NODE_URL: 'ws://localhost:3014/channel',
  BACKEND_SERVICE_URL: 'http://localhost:4000'
```
with this command:
`ng serve --configuration=localhost`

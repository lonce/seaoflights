Install
   Assuming you have already installed node.js, then in the BasicWebTemplate directory (the one containing nodeServer.js), type:
   npm install
   The express and socket.io will be put in the node_modules directory.

Now your main directory will look like this:
  node_modules  [folder with the installed libraries]
  www           [folder with files to be served.] 
	               
  nodeServer.js [the server code]


To run the server, at the command prompt:
node nodeServer.js port#   // for example:  node nodeServer.js 9000

Then open your browser, and type a URL:
	localhost:[port# you provided to node]/file_name ]  (to serve in the www/ subtree)
For example,
	localhost:9000/index.html



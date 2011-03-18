var ws = require('websocket-server');

var server = ws.createServer({
  debug: true,
  useStorage: true
});

// Lifecycle event handlers

server.addListener("listening", function() {
  console.log("Listening for incoming connections")
});

server.addListener("close", function(conn){
  console.log("Connection lost, connection.id=" + conn.id);
});

// Client handling logic

server.addListener("connection", function(conn) {
  console.log("Connection opened, id=" + conn.id);
  
  // send the initial connection msg
  conn.send("connection,"+conn.id);
  
  conn.addListener("message", function(msg) {
    console.log("Received message, message=\"" + msg + "\"");
    
    var handler;
    var parts = msg.split(",");

    switch (parts[0]) {
    case "join":
      handler = handleJoin;
      break;    
      
    case "poke":
      handler = handlePoke;
      break;
      
    case "openTab":
      handler = handleOpenTab;
      break;
    }
    
    handler.apply(this, [conn].concat(parts.slice(1)))
  });
  
  conn.addListener("close", function() {
    console.log("Connection closed, id=" + conn.id);
    
    deleteConnClusters(conn);
  });
});

// HANDLER FUNCTIONS

var handleJoin = function(conn, clusterID) {
  getConnClusters(conn).push(clusterID);
  getCluster(clusterID).push(conn);
};

var handleOpenTab = function(conn, clusterID, url) {
  broadcastToCluster(clusterID, "openTab," + conn.id + "," + url);
};

var handlePoke = function(conn, clusterID) {
  broadcastToCluster(clusterID, "poke," + conn.id);
};

var broadcastToCluster = function(clusterID, msg) {
  var cluster = getCluster(clusterID);
  var len = cluster.length;
  for (var i = 0; i < len; i++) {
    cluster[i].send(msg);
  }
};

// CLUSTER MANAGEMENNT

clusters = {};
connsToClusters = {};

var getConnClusters = function(conn) {
  return connsToClusters[conn.id] == undefined
    ? connsToClusters[conn.id] = []
    : connsToClusters[conn.id];
};

var deleteConnClusters = function(conn) {
  var clusters = getConnClusters(conn);
  var len = clusters.length;
  
  for (var i = 0; i < len; i++) {
    var cluster = getCluster(clusters[i]);
    
    // find user in cluster, and splice out
    var len2 = cluster.length;
    for (var j = 0; j < len2; j++) {
      if (cluster[j] != conn) {
        continue;
      }
      
      cluster.splice(j, 1);
      break;
    }
  }
  
  delete connsToClusters[conn.id];
};

var getCluster = function(clusterID) {
  return clusters[clusterID] == undefined
    ? clusters[clusterID] = []
    : clusters[clusterID];
};

server.listen(7000);
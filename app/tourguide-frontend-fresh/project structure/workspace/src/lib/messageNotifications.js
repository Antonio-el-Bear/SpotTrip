export function subscribeToMessageNotifications(onEvent) {
  if (typeof window === "undefined" || typeof onEvent !== "function") {
    return function() {};
  }

  var disposed = false;
  var reconnectTimer = null;
  var socket = null;

  function scheduleReconnect() {
    if (disposed || reconnectTimer) {
      return;
    }

    reconnectTimer = window.setTimeout(function() {
      reconnectTimer = null;
      connect();
    }, 3000);
  }

  function connect() {
    if (disposed) {
      return;
    }

    var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new window.WebSocket(protocol + "//" + window.location.host + "/ws/notifications/");

    socket.onmessage = function(event) {
      try {
        onEvent(JSON.parse(event.data));
      } catch (error) {}
    };

    socket.onclose = function() {
      socket = null;
      scheduleReconnect();
    };

    socket.onerror = function() {
      if (socket) {
        socket.close();
      }
    };
  }

  connect();

  return function() {
    disposed = true;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
    }
    if (socket) {
      socket.onclose = null;
      socket.close();
      socket = null;
    }
  };
}
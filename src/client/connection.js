// MU* protocol carried over the WebSocket API.
class Connection {

  static get CHANNEL_TEXT() { return 't'; }
  static get CHANNEL_JSON() { return 'j'; }
  static get CHANNEL_HTML() { return 'h'; }
  static get CHANNEL_PUEBLO() { return 'p'; }
  static get CHANNEL_PROMPT() { return '>'; }

  // Encode a string into Latin-1 bytes.
  static encodeLatin1(str) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  // Decode Latin-1 bytes into a string.
  static decodeLatin1(buf) {
    let s = '';
    for (let i = 0; i < buf.length; i++) {
      s += String.fromCharCode(buf[i]);
    }
    return s;
  }

  // Strip Telnet control sequences and optionally respond to them.
  static filterTelnet(bytes, socket) {
    const out = [];
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b === 255) { // IAC
        const cmd = bytes[++i];
        if (cmd === 255) {
          out.push(255); // Escaped 0xFF
        } else if (cmd === 250) { // SB ... SE
          while (i < bytes.length && !(bytes[i] === 255 && bytes[i + 1] === 240)) {
            i++;
          }
          i++; // skip SE
        } else if (cmd === 251 || cmd === 252 || cmd === 253 || cmd === 254) {
          const opt = bytes[++i];
          let resp = null;
          if (cmd === 253) { // DO
            resp = 252; // WONT
          } else if (cmd === 251) { // WILL
            resp = 254; // DONT
          }
          if (resp !== null && socket && socket.readyState === 1) {
            socket.send(new Uint8Array([255, resp, opt]));
          }
        } else {
          // ignore other commands
        }
      } else {
        out.push(b);
      }
    }
    return new Uint8Array(out);
  }

  constructor(url) {
    this.url = url;
    this.socket = null;
    this.isOpen = false;
    
    this.onOpen = null;
    this.onError = null;
    this.onClose = null;

    this.onUpdate = null;
    this.onText = null;
    this.onObject = null;
    this.onHTML = null;
    this.onPueblo = null;
    this.onPrompt = null;
    
    this.hasData = false;
    
    this.reconnect();
  }
  
  static onopen(that, evt) {
    that.isOpen = true;
    that.onOpen && that.onOpen(evt);
  }

  static onerror(that, evt) {
    that.isOpen = false;
    that.onError && that.onError(evt);
  }

  static onclose(that, evt) {
    that.isOpen = false;
    that.onClose && that.onClose(evt);
  }

  static onmessage(that, evt) {
    // Handle raw telnet bytes from the server.
    let data = evt.data;
    if (!(data instanceof ArrayBuffer)) {
      data = (new TextEncoder()).encode(String(data)).buffer;
    }
    const bytes = new Uint8Array(data);
    const filtered = Connection.filterTelnet(bytes, that.socket);
    const text = Connection.decodeLatin1(filtered);

    that.onMessage && that.onMessage(Connection.CHANNEL_TEXT, text);
  }

  reconnect(url=null) {
    var that = this;
    
    // quit the old connection, if we have one
    if (this.isConnected()) {
      this.sendText('QUIT');
    }
    
    this.url = url || this.url;
    
    this.socket = new window.WebSocket(this.url, ['binary']);
    this.isOpen = false;
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = function (evt) {
      Connection.onopen(that, evt);
    };

    this.socket.onerror = function (evt) {
      Connection.onerror(that, evt);
    };

    this.socket.onclose = function (evt) {
      Connection.onclose(that, evt);
    };

    this.socket.onmessage = function (evt) {
      Connection.onmessage(that, evt);
    };
  }
  
  isConnected() {
    return (this.socket && this.isOpen && (this.socket.readyState === 1));
  }

  close() {
    this.socket && this.socket.close();
  }

  sendText(data) {
    if (this.isConnected()) {
      const buf = Connection.encodeLatin1(data + '\r\n');
      this.socket.send(buf);
    }
  }

  sendObject(data) {
    this.isConnected() && this.socket.send(Connection.CHANNEL_JSON + window.JSON.stringify(data));
  }

  onMessage(channel, data) {
    this.onUpdate && this.onUpdate(channel, data);
    this.hasData = true;
    
    switch (channel) {
    case Connection.CHANNEL_TEXT:
      this.onText && this.onText(data);
      break;

    case Connection.CHANNEL_JSON:
      try {
        this.onObject && this.onObject(window.JSON.parse(data));
      }
      catch (e) {
        console.log("JSON ERROR ", e, data);
      }
      break;

    case Connection.CHANNEL_HTML:
      this.onHTML && this.onHTML(data);
      break;

    case Connection.CHANNEL_PUEBLO:
      this.onPueblo && this.onPueblo(data);
      break;
    
    case Connection.CHANNEL_PROMPT:
      this.onPrompt && this.onPrompt(data);
      break;

    default:
      window.console && window.console.log('unhandled message', channel, data);
      return false;
    }

    return true;
  }


}

export default Connection;


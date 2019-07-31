class RemoteSlavePort {
  constructor (id) {
    this._port = null;
    this._manifest = {};
    this._commands = {};
    this._handlers = {};

    async function _receive({ cmd, args, rsvp }) {
      if (cmd && this._handlers[cmd]) {
        try {
          const res = await this._handlers[cmd](args);
          const [result, transfer] = [].concat(res);
          port.postMessage({ result, re: rsvp }, transfer)
        } catch (error) {
          port.postMessage({ error: error.message || String(error), re: rsvp })
        }
      };
    }

    async function _trigger(ev,data) {
      for (var h in this._handlers[ev]) {
        this._handlers[ev][h](data);
      }
    }

    async function _connect (ev) {
      if (ev.source !== window.parent) return;
      if (!ev.data || !ev.data.port || !ev.data[id] === 'connect') return;
      port = ev.data.port;
      port.postMessage({ [id]: 'connected', manifest: this._manifest })
      window.removeEventListener('message', _connect);
      port.onmessage = ev => {
        _receive(ev.data);
      }
    }

    window.addEventListener('message', _connect);
  
    this.command('test-ping', () => 'pong');
    this.command('test-log', (data) => { console.log(data) })
    this.command('test-echo', (data) => data);
  }

  manifest(m) {
    this._manifest = m;
    return this;
  }

  on(ev, fn) {
    this._handlers[ev] = this._handlers[ev] || [];
    this._handlers[ev].push(fn);
    return this;
  }

  command(cmd, fn) {
    this._commands[cmd] = fn;
    return this;
  }

  trigger(event, data = {}) {
    port.postMessage({ event, data });
    return this;
  }
}

export class RemoteSlavePort {
  constructor(id) {
    this._port = null;
    this._manifest = {};
    this._commands = {};
    this._handlers = {};

    const _receive = async ({ cmd, args, rsvp }) => {
      try {
        if (!cmd) {
          this.throw("slave-specify-command");
        }
        if (!this._commands[cmd]) {
          this.throw("slave-no-such-command");
        }
        const res = await this._commands[cmd](args);
        const [result, transfer] = [].concat(res);
        this._port.postMessage({ result, re: rsvp }, transfer)
      } catch (error) {
        this._port.postMessage({ error: error.error| error.message || String(error), data:error.data || {}, re: rsvp })
      }
    }

    const _trigger = async (ev, data) => {
      for (var h in this._handlers[ev]) {
        this._handlers[ev][h](data);
      }
    }

    const _connect = (ev) => {
      if (ev.source !== window.parent) return;
      if (!ev.data || !ev.data.port || !ev.data[id] === 'connect') return;
      this._port = ev.data.port;
      this._port.postMessage({ [id]: 'connected', manifest: this._manifest })
      window.removeEventListener('message', _connect);
      this._port.onmessage = ev => {
        _receive(ev.data);
      }
    }

    window.addEventListener('message', _connect);
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

  throw(error, data = {}) {
    throw { error, data }
  }
}

let instance = null;

class Context {
  constructor() {
      if (instance) {
         return instance;
      }
      this.props = {};
  }

  setProp(name, prop) {
    this.props[name] = prop;
  }

  getProp(name) {
    return this.props[name] || null;
  }

  getProps() {
    return this.props;
  }
}


export default Context;

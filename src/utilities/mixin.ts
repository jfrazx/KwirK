
export namespace Mixin {
  export function mix(derived: any, ...mixable: any[]): any {
    const proto = derived.prototype || derived;
    mixable.forEach(base => {
      if (base.prototype) {
        Object.getOwnPropertyNames(base.prototype).forEach(name => {
          if (name !== 'constructor') {
            proto[name] = base.prototype[name];
          }
        });
      }
      else {
        Object.keys(base).forEach(name => {
          proto[name] = base[name];
        });
      }
    });

    return derived;
  }
}

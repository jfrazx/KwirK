
export class Mixin {
  static apply(derived: any, mixins: any[]) {
    mixins.forEach(base => {
        Object.getOwnPropertyNames(base.prototype).forEach(name => {
            derived.prototype[name] = base.prototype[name];
        });
    });
  }
}


export class Mixin {
  static apply(derived: any, mixins: any[]) {
    mixins.forEach(base => {
      if ( base.prototype ) {
        Object.getOwnPropertyNames(base.prototype).forEach(name => {
            derived.prototype[name] = base.prototype[name];
        });
      }
      else {
        Object.keys( base ).forEach( name => {
          derived.prototype[name] = base[name];
        });
      }
    });
  }
}

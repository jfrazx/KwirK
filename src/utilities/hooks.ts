
// work in progress

export class Hooks {

  private static _pres: any;

  constructor() {

  }

  static pre( name: string, isAsync: boolean, callback: Function, errorCallback?: Function ): void;
  static pre( name: string, callback: Function, errorCallback?: Function): void;
  static pre( name: string, isAsync?: any, callback?: Function, errorCallback?: Function ): void {

    if ( typeof isAsync === 'function' )
      [ isAsync, callback, errorCallback ] = [ false, isAsync, callback ];

    var proto = this.prototype || this;
    // var pres  = proto._pres = proto._pres || {};



  }
}


var Kwirk = require('../../index');
var Hook  = Kwirk.Hook;
var assert = require('assert');
var emitter = Hook.emitter;

describe('Hook', function(){
  describe('regsiterPre', function(){
    it('should register a pre Hook', function(){

      var result = Hook.registerPre('connect', {
        reference: 'registerPreConnectionTest',
        callback: function(next) {
           next(null, 'registerPre');
        },

      });

      assert.equal(result, true);
    });

    it('should not register the same reference pre Hook', function(){
      var result = Hook.registerPre('connect', {
        reference: 'registerPreConnectionTest',
        callback: function(next) {
           next(null, 'registerPre');
        }
      });

      assert.equal(result, false);
    });

    it ( 'should emit' )
  });
});

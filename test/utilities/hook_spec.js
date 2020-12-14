
const Kwirk = require('../../index');
const Hook = Kwirk.Hook;
const assert = require('assert');
const emitter = Hook.emitter;

describe('Hook', () => {
  describe('regsiterPre', () => {
    it('should register a pre Hook', () => {
      const result = Hook.registerPre('connect', {
        reference: 'registerPreConnectionTest',
        callback: (next) => {
          next(null, 'registerPre');
        },

      });

      assert.equal(result, true);
    });

    it('should not register the same reference pre Hook', () => {
      const result = Hook.registerPre('connect', {
        reference: 'registerPreConnectionTest',
        callback: (next) => {
          next(null, 'registerPre');
        }
      });

      assert.equal(result, false);
    });

    it('should emit')
  });
});

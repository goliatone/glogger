/*global define:true, describe:true , it:true , expect:true, 
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['glogger', 'jquery'], function(GLogger, $) {

    describe('just checking', function() {

        it('GLogger should be loaded', function() {
            expect(GLogger).toBeTruthy();
            var glogger = new GLogger();
            expect(glogger).toBeTruthy();
        });

        it('GLogger should initialize', function() {
            var glogger = new GLogger();
            var output   = glogger.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });
        
    });

});
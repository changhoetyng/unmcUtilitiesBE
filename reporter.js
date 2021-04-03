const mocha = require('mocha');
const fs = require('fs');
const os = require("os");
module.exports = Reporter;

function Reporter(runner, options) {
    this._mochaFile = options.reporterOptions.mochaFile || process.env.MOCHA_FILE || 'test-results.txt';
  
    mocha.reporters.Base.call(this, runner);
    var passes = 0;
    var failures = 0;
  
    runner.on('start', function() {
      if (fs.existsSync(this._mochaFile)) {
        console.log('Removing existing test result file!');
        fs.unlinkSync(this._mochaFile);
      }
    }.bind(this));
  
    runner.on('pass', function(test){
      passes++;
      console.log('Pass: %s', test.fullTitle());
      fs.appendFileSync(this._mochaFile, 'Pass: ' + test.fullTitle() + os.EOL);
    }.bind(this));
  
    runner.on('fail', function(test, err){
      failures++;
      console.log('Fail: %s -- error: %s', test.fullTitle(), err.message);
      fs.appendFileSync(this._mochaFile, 'Fail: ' + test.fullTitle() + 'Error: ' + err.message + os.EOL);
    }.bind(this));
  
    runner.on('end', function(){
      console.log('Test Summary: %d/%d', passes, passes + failures);
      fs.appendFileSync(this._mochaFile, os.EOL + 'Test Summary: ' + passes + '/' + (passes + failures) + os.EOL);
    }.bind(this));
  }

"use strict";

/* eslint global-require: 0 */

/* eslint import/no-dynamic-require: 0 */
var fs = require('fs');

module.exports = function () {
  return {
    noColors: true,
    startTime: null,
    afterErrList: false,
    uaList: null,
    report: '',
    images: '',
    table: '',
    tableReports: '',
    testCount: 0,
    skipped: 0,
    currentTestNumber: 1,
    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      this.startTime = startTime;
      this.uaList = userAgents.join(', ');
      this.testCount = testCount;
    },
    reportFixtureStart: function reportFixtureStart(name) {
      this.currentFixtureName = name;
    },
    reportTestDone: function reportTestDone(name, testRunInfo) {
      var hasErr = !!testRunInfo.errs.length;
      var result = hasErr ? 'failed' : 'passed';

      var _this = this;

      if (testRunInfo.skipped) {
        this.skipped += 1;
      }

      if (testRunInfo.screenshots) {
        testRunInfo.screenshots.forEach(function (screenshot) {
          _this.images += "&nbsp;&nbsp;<img class=\"thumbImg\" src=\"data:image/png;base64, ".concat(fs.readFileSync(screenshot.screenshotPath.replace('-actual.png', '-diff.png'), {
            encoding: 'base64'
          }), "\"/>");
        });
      }

      this.compileTestTable(name, testRunInfo, hasErr, result);

      if (hasErr) {
        this.compileErrors(name, testRunInfo);
      }

      this.currentTestNumber += 1;
    },
    compileErrors: function compileErrors(name, testRunInfo) {
      var _this = this;

      var heading = "".concat(this.currentTestNumber, ". ").concat(this.currentFixtureName, " - ").concat(name);
      this.report += this.indentString("<h4 id=\"test-".concat(this.currentTestNumber, "\">").concat(heading));

      if (testRunInfo.screenshots) {
        testRunInfo.screenshots.forEach(function (screenshot) {
          _this.report += "&nbsp;&nbsp;<img class=\"thumbImg\" src=\"data:image/png;base64, ".concat(fs.readFileSync(screenshot.screenshotPath, {
            encoding: 'base64'
          }), "\"/>");
        });
      }

      this.report += '</h4>\n';
      testRunInfo.errs.forEach(function (error) {
        _this.report += _this.indentString('<pre>');
        _this.report += _this.escapeHtml(_this.formatError(error, '')).replace('{', '&#123').replace('}', '&#125');
        _this.report += _this.indentString('</pre>');
      });
    },
    compileTestTable: function compileTestTable(name, testRunInfo, hasErr, result) {
      if (hasErr) {
        this.tableReports += this.indentString('<tr class="danger">\n');
      } else if (testRunInfo.skipped) {
        this.tableReports += this.indentString('<tr class="warning">\n');
      } else {
        this.tableReports += this.indentString('<tr class="success">\n');
      } // Number


      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentTestNumber;
      this.tableReports += '</td>\n'; // Fixture

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.currentFixtureName;
      this.tableReports += '</td>\n'; // Test

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += name;
      this.tableReports += '</td>\n'; // Browsers

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.uaList;
      this.tableReports += '</td>\n'; // Duration

      this.tableReports += this.indentString('<td>', 2);
      this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
      this.tableReports += '</td>\n'; // Result

      this.tableReports += this.indentString('<td>', 2);

      if (testRunInfo.skipped) {
        this.tableReports += 'skipped';
      } else if (result === 'failed') {
        this.tableReports += "<a href=\"#test-".concat(this.currentTestNumber, "\">failed</a>");
      } else {
        this.tableReports += result;
      }

      this.tableReports += '</td>\n';
      this.tableReports += this.indentString('</tr>\n');
    },
    reportTaskDone: function reportTaskDone(endTime, passed
    /* , warnings */
    ) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var failed = this.testCount - passed; // Opening html

      var html = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">\n    <link rel=\"stylesheet\" href=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Contents/bootstrap-sortable.css\">\n    <script\n            src=\"https://code.jquery.com/jquery-3.3.1.min.js\"\n            integrity=\"sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\"\n            crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/bootstrap-sortable.js\"></script>\n    <script src=\"https://cdn.rawgit.com/drvic10k/bootstrap-sortable/ff650fd1/Scripts/moment.min.js\"></script>\n    <style>\n      body {font-family: Arial, Helvetica, sans-serif;}\n\n      .thumbImg {\n        width: 100%;\n        max-width: 35px;\n        border-radius: 3px;\n        cursor: pointer;\n        margin-bottom: 5px;\n        border-width: 1px;\n        border-color: #f1f1f1;\n        border-style: solid;\n      }\n\n      .modal {\n        display: none;\n        position: fixed;\n        z-index: 1;\n        padding-top: 100px;\n        left: 0;\n        top: 0;\n        width: 100%;\n        height: 100%;\n        overflow: auto;\n        background-color: rgba(0,0,0,0.7);\n      }\n\n      .modal-content {\n        margin: auto;\n        display: block;\n        width: 80%;\n        max-width: 700px;\n      }\n\n      .closeModal {\n        position: absolute;\n        top: 15px;\n        right: 35px;\n        color: #f1f1f1;\n        font-size: 40px;\n        font-weight: bold;\n        transition: 0.3s;\n      }\n\n      .closeModal:hover,\n      .closeModal:focus {\n        cursor: pointer;\n      }\n    </style>\n  </head>\n  <body>\n    <div id=\"myModal\" class=\"modal\">\n      <span class=\"closeModal\">&times;</span>\n      <img class=\"modal-content\" id=\"modelImage\">\n    </div>\n    <div class=\"container\">\n"; // Now add a summary

      html += "\n      <h1 class=\"text-primary\">TestCafe Test Summary</h1>\n      <br>\n      <div class=\"client-logo\" style=\"padding:15px\"></div>\n      <div class=\"bg-primary\" style=\"padding:15px\">\n        <h3>Summary</h3><br>\n        <p class=\"lead\">Start Time: ".concat(this.startTime, "</p>\n        <p class=\"lead\">Browsers: ").concat(this.uaList, "</p>\n        <p class=\"lead\">Duration: ").concat(durationStr, "</p>\n        <p class=\"lead\">Tests Failed: ").concat(failed, " out of ").concat(this.testCount, "</p>\n        <p class=\"lead\">Tests Skipped: ").concat(this.skipped, "</p>\n      </div><br>"); // Summary table

      html += "\n      <table class=\"table sortable\">\n        <thead>\n          <tr>\n            <th>#</th>\n            <th>Fixture</th>\n            <th>Test Name</th>\n            <th>Browsers</th>\n            <th>Duration</th>\n            <th>Result</th>\n          </tr>\n        </thead>\n        <tbody>\n          ".concat(this.tableReports, "\n        </tbody>\n      </table>\n      <br><br>\n      "); // Error details

      html += "\n      <h3>Screenshots</h3>\n      <br>\n      ".concat(this.images); // closing html
      
      html += "\n      <h3>Error Details</h3>\n      <br>\n      ".concat(this.report); // closing html

      html += "\n    </div>\n    <script>\n      const modal = document.getElementById('myModal');\n      const modalImage = document.getElementById(\"modelImage\");\n\n      Array.from(document.getElementsByClassName(\"thumbImg\")).forEach(function(el) {\n        el.onclick = function() {\n          modal.style.display = \"block\";\n          modalImage.src = this.src;\n        }\n      });\n      \n      document.getElementsByClassName(\"closeModal\")[0].onclick = function() {\n        modal.style.display = \"none\";\n      }\n    </script>\n  </body>\n</html>";
      this.write(html);
    }
  };
};
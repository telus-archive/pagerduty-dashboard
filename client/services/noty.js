/* global noty, $ */
module.exports = function () {
  var current;
  return {
    update: function (type, message) {
      if (!current || message !== current.options.text || current.closed) {
        $.noty.closeAll();
        current = noty({
          text: message,
          layout: 'bottom',
          type: type
        });
      }
    },
    clear: $.noty.closeAll
  };
};

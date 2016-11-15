/**
  H5表单验证
  kakagan-validator.js
**/

;(function (root, factory) {
  root.kakaganValidator = factory();
})(window, function () {
  var rules = ['required', 'minlength', 'maxlength', 'range', 'email', 'phone'];
  var matchRuleStrategy, getFormEl, getValidateEls, cancelFormSelfValidate;

  matchRuleStrategy = function () {

    // 非空
    required: function (input) {
      return input !== '' && !!input.length;
    },

    // 长度是否超过设定的长度
    limitLength: function () {

    },

    // 取值范围
    range: function () {

    },

    // 邮箱
    email: function () {

    },

    // 手机：仅仅中国地区，以1开头，第2位为3-9，总位数为11
    phone: function (input) {
      return /^1[3-9]\d{9}$/.test(input);
    }
  };

  getFormEl = function (formSelector) {
    return document.querySelector(formSelector);
  };

  // 获取所有待验证的dom
  getValidateEls = function (parentEl) {
    return parentEl.querySelectorAll('[rule]');
  };

  // 取消H5表单的默认验证，原因各个浏览器风格不统一
  cancelFormSelfValidate = function (el) {
    el.getAttribute('novalidate') || el.setAttribute('novalidate', 'true');
  };

  function DoValidate (formSelector, options) {
    var formEl = getFormEl(formSelector);
    var validateEls = getValidateEls(formEl);

    // 错误提示class
    var errorClass = options.errorClass || 'error';

    // 触发验证的方式
    var type = options.type || 'blur';

    // 表单验证前处理函数
    var beforeFunc = options.beforeFunc;

    // 表单验证成功后处理函数
    var afterFunc = options.afterFunc;
  }

  function validator (formSelector, options) {
    return new DoValidate(options);
  }

  return validator;
});

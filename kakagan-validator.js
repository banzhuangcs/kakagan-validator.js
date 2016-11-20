/**
  H5表单验证
  kakagan-validator.js
**/

;(function (root, factory) {
  root.kakaganValidator = factory();
})(window, function () {
  var rules = [
    'required',
    'minlength',
    'maxlength',
    'range',
    'email',
    'url',
    'tel',
    'mobile'
  ];
  var matchRuleStrategy, isNumeric, getFormEl, doValidate, bindEvent,
      getValidateEls, cancelFormSelfValidate, restartPackageFields,
      getSpecialEls, getInputs, getCheckboxs, getRadioboxs;

  // 是否全部是数字
  isNumeric = function (input) {
    return /^\d+$/.test(input);
  };

  bindEvent = function (els, eventName, handle) {
    (Array.isArray(els)) || (els = [ els ]);

    els.forEach(function (el, index) {
      el.addEventListener(
        eventName,
        (function (index, e) { handle(index, e) }).bind(null, index),
        false
      );
    });
  };

  matchRuleStrategy = function () {
    // 非空
    required: function (input) {
      return input !== '' && !!input.length;
    },

    // 最小字符长度
    minlength: function (input, min) {
      return input.length >= min;
    },

    // 最大字符长度
    maxlength: function (input, max) {
      return input.length <= max;
    },

    // 取值范围
    range: function (input, min, max) {
      var ret = true;
      min = +min;
      max = +max;

      if (!isNaN(min) && !isNaN(max)) {
        return input >= min && input <= max;
      }

      return ret;
    },

    // 邮箱：开头第一个字符只能是字母、数字、下划线
    // 必须包括@字符
    // 邮箱服务提供商和后缀域名，后缀域名目前最少的是2个字符，最多的是6个字符
    email: function (input) {
      return /^\w([\w-\\.]*?)@([a-z0-9]+)\.([a-z]{2,6})$/i.test(input);
    },

    // 电话：中国地区
    // 区号(3-4位)-号码(7位)-分机号(3位以上)
    tel: function (input) {
      return /^(\d{3,4}-)?(\d{7}-)(\d{3})$/.test(input);
    },

    // 手机：仅仅中国地区，以1开头，第2位为3-9，总位数为11
    mobile: function (input) {
      return /^1[3-9]\d{9}$/.test(input);
    },

    // url
    url: function (input) {
      return /[a-z]+:\/\/[^\s]/.test(input);
    }
  };

  getFormEl = function (formSelector) {
    return document.querySelector(formSelector);
  };

  // 获取所有待验证的dom
  getValidateEls = function (parentEl) {
    return parentEl.querySelectorAll('[data-rule]');
  };

  getSpecialEls = function (callback) {
    return function (els) {
      return Array
        .from(els)
        .filter(function (el) {
          return callback(el);
        });
    };
  };

  getCheckboxs = getSpecialEls(function (el) {
    return el.type === 'checkbox'
  });

  getRadioboxs = getSpecialEls(function (el) {
    return el.type === 'radio';
  });

  getInputs = getSpecialEls(function (el) {
    return el.type === 'text';
  });

  // 取消H5表单的默认验证，原因各个浏览器风格不统一
  cancelFormSelfValidate = function (el) {
    el.getAttribute('novalidate') || el.setAttribute('novalidate', 'true');
  };

  // 重新组装要验证的列
  restartPackageFields = function (els) {
    return Array
      .from(els)
      .map(function (el) {
        return {
          rules: el.dataset.rule.split(' '),
          failClass: el.dataset.failClass,
          value: el.value
        };
      });
  };

  // 验证
  doValidate = function (rule, value) {
    return !rules.find(rule) || matchRuleStrategy[rule](value);
  };

  /**
   @description
   TODO
    1、标识需要验证的dom
    2、声明错误提示class追加方式(默认追加到当前元素的父元素上)
    3、验证触发方式 "form submit"、"blur"(默认是blur)
    4、验证前触发的before函数
    5、验证成功后的after函数
    7、异步验证
  **/
  function Validate (formSelector, options) {
    var formEl = getFormEl(formSelector);
    var validateEls = getValidateEls(formEl);
    var fields = restartPackageFields(validateEls);
    var fails = [];

    // 错误提示class追加到当前验证元素还是验证元素的父元素上，默认是父元素上
    var failClassAppendType = options.failClassAppendType || 'parent';
    // 提交验证的方式
    var submitType = options.submitType || 'blur';
    // 表单验证前处理函数
    var beforeFunc = options.beforeFunc;
    // 表单验证成功后处理函数
    var afterFunc = options.afterFunc;

    if (submitType === 'blur') {
      // 绑定type="input" blur事件
      bindEvent(getInputs(validateEls), 'blur', function (e) {
        var inputEl = e.currentTarget;
        var rules = inputEl.dataset.rule.split(' ');
        var value = inputEl.value;
        var match = rules.every((function (value) {
          return function (rule) {
            doValidate(rule, value);
          }
        })(value));
      });
    }
  }

  function validator (formSelector, options) {
    return new Validate(options);
  }

  return validator;
});

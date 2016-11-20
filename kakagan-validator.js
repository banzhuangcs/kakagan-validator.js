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
  var matchRuleStrategy, isNumeric, doValidate, bindEvent, each,
      cancelFormSelfValidate, restartPackageFields, validateFormFieldByBlur, validateFormFieldBySubmit, validateField,
      getSpecialEls, getInputs, getCheckboxs, getRadioboxs;

  // 是否全部是数字
  isNumeric = function (input) {
    return /^\d+$/.test(input);
  };

  bindEvent = function (els, eventName, handle) {
    if (!Array.isArray(els)) {
      if ('length' in els)
        els = Array.prototype.slice.call(els);
      else
        els = [ els ];
    }

    els.forEach(function (el, index) {
      el.addEventListener(
        eventName,
        (function (index, e) { handle.call(this, index, e) }).bind(null, index),
        false
      );
    });
  };

  each = function (arr, callback) {
    if (Array.isArray(arr)) {
      for (var i = 0, length = arr.length; i < length; i++) {
        if (callback(arr[i], i, arr) === false) {
          return false;
        }
      }
    }
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
    @description 验证表单项
    TODO
      没通过 => { required: el, email: el }
      通过 => true
  **/
  validateField = function (el, failClassAppendType) {
    var value = el.value;
    var dataset = el.dataset;
    var rules = dataset.rule.split(' ');
    var ruleMap = {};
    var failClass;

    rules.forEach(function (rule) {
      if (!doValidate(rule, value)) {
        failClass = rule.indexOf('required') >= 0 ?
          'empty' : 'uninvalid';

        ruleMap[rule] = (
          failClassAppendType === 'current'
            ? el.classList.add(failClass)
            : el.parentNode.classList.add(failClass),
          el
        );
      }
    });

    return Object.keys(ruleMap).length ? ruleMap : true;
  };

  /**
    @description
    'blur'事件验证表单
    如果验证成功，返回true，否则返回包含错误信息对象的数组
  **/
  validateFormFieldByBlur = function (els, submitType, failClassAppendType) {
    var match;

    if (submitType === 'blur') {
      bindEvent(els, 'blur', function (index, e) {
        validateField(this, failClassAppendType);
      });
    }
  };

  /**
    @description
    'submit'事件验证表单
  **/
  validateFormFieldBySubmit = function (formEl, els, failClassAppendType, beforeFunc, failFunc, fullFunc) {
    var uninvalids = [], match;

    bindEvent(formEl, 'submit', function (index, e) {
      beforeFunc(els);

      Array.from(els).forEach(function (el) {
        (match = validateField(el, failClassAppendType) !== true) && uninvalids.push(match);
      });

      uninvalids.length
        ? (e.preventDefault(), failFunc(uninvalids))
        : fullFunc(els);
    });
  };

  /**
   @description
   TODO
     1、标识需要验证的dom
     2、声明错误提示class追加方式(默认追加到当前元素的父元素上)
     3、验证触发方式 "form submit"、"blur"(默认是blur)
     4、验证前触发的before函数
     5、验证失败的fail函数
     6、验证成功的full函数
     7、异步验证
  **/
  function validate (formSelector, options) {
    var formEl = document.querySelector(formSelector);
    var validateEls = formEl.querySelectorAll(formEl);
    var uninvalids;

    // 错误提示class追加到当前验证元素还是验证元素的父元素上，默认是父元素上
    var failClassAppendType = options.failClassAppendType || 'current';
    // 提交验证的方式
    var submitType = options.submitType || 'blur';
    // 表单验证前处理函数
    var beforeFunc = options.beforeFunc;
    // 表单验证失败处理函数
    var failFunc = options.failFunc;
    // 表单验证成功处理函数
    var fullFunc = options.fullFunc;

    // 监听blur事件，验证表单项
    validateFormFieldByBlur(validateEls, submitType, failClassAppendType);

    // 监听submit事件
    validateFormFieldBySubmit(formEl, validateEls, failClassAppendType, beforeFunc, failFunc, fullFunc);
  }

  return validate;
});

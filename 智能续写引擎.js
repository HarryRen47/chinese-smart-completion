/**
 * 中文智能续写引擎
 * 基于规则匹配和数据处理的自动补全系统
 */

class ChineseSmartCompletion {
  constructor() {
    this.rules = this.initializeRules();
    this.cache = new Map();
    this.initializeData();
  }

  /**
   * 初始化识别规则
   */
  initializeRules() {
    return [
      {
        category: 'math',
        priority: 1,
        patterns: [
          /^(\d+(?:\.\d+)?)\s*[+\-*/]\s*(\d+(?:\.\d+)?)$/,
          /^(\d+(?:\.\d+)?)\s*(加|减|乘|除)\s*(\d+(?:\.\d+)?)$/,
          /^(\d+(?:\.\d+)?)\s*的\s*(平方根|立方根)$/
        ],
        handler: this.handleMathCalculation.bind(this)
      },
      {
        category: 'date',
        priority: 2,
        patterns: [
          /^(\d+)\s*(天|日|周|月|年)\s*(后|前)$/,
          /^(今天|明天|后天|昨天|前天|下周|上周)$/
        ],
        handler: this.handleDateCalculation.bind(this)
      },
      {
        category: 'timezone',
        priority: 3,
        patterns: [
          /^([\u4e00-\u9fa5]+|[A-Za-z]+)\s*时间$/,
          /^(\d{1,2})[:\.]?(\d{2})?\s*(点|时)\s*([\u4e00-\u9fa5]+)\s*(时间)?$/
        ],
        handler: this.handleTimezoneQuery.bind(this)
      },
      {
        category: 'unit',
        priority: 4,
        patterns: [
          /^(\d+(?:\.\d+)?)\s*(摄氏度|华氏度|℃|℉)\s*(等于|转换为)?$/,
          /^(\d+(?:\.\d+)?)\s*(米|厘米|千米|英尺|英寸|m|cm|km|ft|in)\s*(等于|转换为)?$/
        ],
        handler: this.handleUnitConversion.bind(this)
      },
      {
        category: 'currency',
        priority: 5,
        patterns: [
          /^(\d+(?:\.\d+)?)\s*(美元|人民币|欧元|英镑|USD|CNY|EUR|GBP)$/,
          /^(\d+(?:\.\d+)?)\s*(美元|人民币|欧元|英镑)\s*(等于|换算成)?$/
        ],
        handler: this.handleCurrencyConversion.bind(this)
      },
      {
        category: 'formula',
        priority: 6,
        patterns: [
          /^(牛顿第[一二三]定律|欧姆定律|万有引力定律)$/,
          /^(勾股定理|二次方程|圆的面积公式)$/,
          /^(水的分子式|二氧化碳|氧气的化学式)$/
        ],
        handler: this.handleFormulaQuery.bind(this)
      }
    ];
  }

  /**
   * 初始化数据
   */
  initializeData() {
    // 时区映射
    this.timezoneMap = {
      '纽约': 'America/New_York',
      '洛杉矶': 'America/Los_Angeles',
      '伦敦': 'Europe/London',
      '巴黎': 'Europe/Paris',
      '东京': 'Asia/Tokyo',
      '首尔': 'Asia/Seoul',
      '新加坡': 'Asia/Singapore',
      '迪拜': 'Asia/Dubai'
    };

    // 公式数据库
    this.formulaDatabase = {
      '牛顿第二定律': 'F = ma',
      '牛顿第一定律': '物体保持静止或匀速直线运动状态',
      '牛顿第三定律': '作用力与反作用力大小相等，方向相反',
      '欧姆定律': 'V = IR',
      '万有引力定律': 'F = G(m₁m₂)/r²',
      '勾股定理': 'a² + b² = c²',
      '二次方程': 'x = (-b ± √(b²-4ac)) / 2a',
      '圆的面积公式': 'S = πr²',
      '水的分子式': 'H₂O',
      '二氧化碳': 'CO₂',
      '氧气的化学式': 'O₂'
    };

    // 汇率数据（模拟实时数据）
    this.exchangeRates = {
      'USD': { 'CNY': 7.1776, 'EUR': 0.8234, 'GBP': 0.7456 },
      'CNY': { 'USD': 0.1393, 'EUR': 0.1147, 'GBP': 0.1039 },
      'EUR': { 'USD': 1.2143, 'CNY': 8.7234, 'GBP': 0.9054 },
      'GBP': { 'USD': 1.3416, 'CNY': 9.6321, 'EUR': 1.1045 }
    };
  }

  /**
   * 主要处理函数
   */
  async process(input) {
    const cleanInput = this.preprocessInput(input);
    
    // 检查缓存
    if (this.cache.has(cleanInput)) {
      return this.cache.get(cleanInput);
    }

    // 按优先级匹配规则
    for (const rule of this.rules) {
      for (const pattern of rule.patterns) {
        const match = cleanInput.match(pattern);
        if (match) {
          try {
            const result = await rule.handler(match, cleanInput);
            if (result) {
              // 缓存结果
              this.cache.set(cleanInput, result);
              return result;
            }
          } catch (error) {
            console.error(`处理规则 ${rule.category} 时出错:`, error);
          }
        }
      }
    }

    return null;
  }

  /**
   * 预处理输入
   */
  preprocessInput(input) {
    return input.trim()
      .replace(/\s+/g, ' ')
      .replace(/[，。！？；：]/g, '');
  }

  /**
   * 数学计算处理
   */
  handleMathCalculation(match, input) {
    try {
      let expression = input;
      
      // 中文运算符转换
      const replacements = {
        '加': '+',
        '减': '-',
        '乘': '*',
        '除': '/',
        '的平方根': 'sqrt',
        '的立方根': 'cbrt'
      };

      for (const [chinese, symbol] of Object.entries(replacements)) {
        expression = expression.replace(new RegExp(chinese, 'g'), symbol);
      }

      // 处理特殊函数
      if (expression.includes('sqrt')) {
        const num = parseFloat(expression.replace(/.*?(\d+(?:\.\d+)?).*/, '$1'));
        const result = Math.sqrt(num);
        return { type: 'calculation', result: `= ${result}` };
      }

      if (expression.includes('cbrt')) {
        const num = parseFloat(expression.replace(/.*?(\d+(?:\.\d+)?).*/, '$1'));
        const result = Math.cbrt(num);
        return { type: 'calculation', result: `= ${result.toFixed(4)}` };
      }

      // 基础运算
      const basicMatch = expression.match(/^(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)$/);
      if (basicMatch) {
        const [, num1, operator, num2] = basicMatch;
        const a = parseFloat(num1);
        const b = parseFloat(num2);
        
        let result;
        switch (operator) {
          case '+': result = a + b; break;
          case '-': result = a - b; break;
          case '*': result = a * b; break;
          case '/': result = b !== 0 ? a / b : '除数不能为0'; break;
        }
        
        return { type: 'calculation', result: `= ${result}` };
      }
    } catch (error) {
      return { type: 'error', result: '计算错误' };
    }
    
    return null;
  }

  /**
   * 日期计算处理
   */
  handleDateCalculation(match, input) {
    const now = new Date();
    let targetDate = new Date(now);

    // 相对日期处理
    const relativeMatch = input.match(/^(\d+)\s*(天|日|周|月|年)\s*(后|前)$/);
    if (relativeMatch) {
      const [, amount, unit, direction] = relativeMatch;
      const num = parseInt(amount);
      const multiplier = direction === '后' ? 1 : -1;

      switch (unit) {
        case '天':
        case '日':
          targetDate.setDate(targetDate.getDate() + num * multiplier);
          break;
        case '周':
          targetDate.setDate(targetDate.getDate() + num * 7 * multiplier);
          break;
        case '月':
          targetDate.setMonth(targetDate.getMonth() + num * multiplier);
          break;
        case '年':
          targetDate.setFullYear(targetDate.getFullYear() + num * multiplier);
          break;
      }

      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      return { type: 'date', result: `（${month}月${day}日）` };
    }

    // 特殊日期处理
    const specialDates = {
      '今天': 0,
      '明天': 1,
      '后天': 2,
      '昨天': -1,
      '前天': -2
    };

    if (specialDates.hasOwnProperty(input)) {
      targetDate.setDate(targetDate.getDate() + specialDates[input]);
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      return { type: 'date', result: `（${month}月${day}日）` };
    }

    return null;
  }

  /**
   * 时区查询处理
   */
  handleTimezoneQuery(match, input) {
    const cityMatch = input.match(/^([\u4e00-\u9fa5]+|[A-Za-z]+)\s*时间$/);
    if (cityMatch) {
      const city = cityMatch[1];
      const timezone = this.timezoneMap[city];
      
      if (timezone) {
        const time = new Intl.DateTimeFormat('zh-CN', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        
        return { type: 'timezone', result: `（${time}）` };
      }
    }

    return null;
  }

  /**
   * 单位转换处理
   */
  handleUnitConversion(match, input) {
    // 温度转换
    const tempMatch = input.match(/^(\d+(?:\.\d+)?)\s*(摄氏度|华氏度|℃|℉)/);
    if (tempMatch) {
      const [, value, unit] = tempMatch;
      const num = parseFloat(value);

      if (unit === '摄氏度' || unit === '℃') {
        const fahrenheit = (num * 9/5 + 32).toFixed(1);
        return { type: 'conversion', result: `${fahrenheit}华氏度` };
      } else if (unit === '华氏度' || unit === '℉') {
        const celsius = ((num - 32) * 5/9).toFixed(1);
        return { type: 'conversion', result: `${celsius}摄氏度` };
      }
    }

    // 长度转换
    const lengthMatch = input.match(/^(\d+(?:\.\d+)?)\s*(米|厘米|千米|英尺|英寸|m|cm|km|ft|in)/);
    if (lengthMatch) {
      const [, value, unit] = lengthMatch;
      const num = parseFloat(value);

      const conversions = {
        '米': { '英尺': 3.28084, '英寸': 39.3701 },
        'm': { 'ft': 3.28084, 'in': 39.3701 },
        '英尺': { '米': 0.3048 },
        'ft': { 'm': 0.3048 },
        '厘米': { '英寸': 0.393701 },
        'cm': { 'in': 0.393701 }
      };

      // 简单的米转英尺示例
      if (unit === '米' || unit === 'm') {
        const feet = (num * 3.28084).toFixed(2);
        return { type: 'conversion', result: `${feet}英尺` };
      }
    }

    return null;
  }

  /**
   * 汇率转换处理
   */
  handleCurrencyConversion(match, input) {
    const currencyMatch = input.match(/^(\d+(?:\.\d+)?)\s*(美元|人民币|欧元|英镑|USD|CNY|EUR|GBP)$/);
    if (currencyMatch) {
      const [, amount, currency] = currencyMatch;
      const num = parseFloat(amount);

      // 货币代码映射
      const currencyMap = {
        '美元': 'USD',
        '人民币': 'CNY', 
        '欧元': 'EUR',
        '英镑': 'GBP'
      };

      const fromCurrency = currencyMap[currency] || currency;
      
      // 默认转换为人民币
      if (fromCurrency === 'USD') {
        const cnyAmount = (num * this.exchangeRates.USD.CNY).toFixed(4);
        return { type: 'currency', result: `（${cnyAmount} 人民币）` };
      } else if (fromCurrency === 'CNY') {
        const usdAmount = (num * this.exchangeRates.CNY.USD).toFixed(4);
        return { type: 'currency', result: `（${usdAmount} 美元）` };
      }
    }

    return null;
  }

  /**
   * 公式查询处理
   */
  handleFormulaQuery(match, input) {
    if (this.formulaDatabase[input]) {
      return { type: 'formula', result: this.formulaDatabase[input] };
    }
    return null;
  }

  /**
   * 格式化最终输出
   */
  formatOutput(result) {
    if (!result) return '';
    
    switch (result.type) {
      case 'calculation':
        return result.result;
      case 'date':
      case 'timezone':
      case 'currency':
        return result.result;
      case 'conversion':
        return result.result;
      case 'formula':
        return result.result;
      default:
        return result.result || '';
    }
  }
}

// 使用示例
const smartCompletion = new ChineseSmartCompletion();

// 测试函数
async function testCompletion() {
  const testCases = [
    '1+1',
    '3天后',
    '纽约时间',
    '37摄氏度等于',
    '1美元',
    '牛顿第二定律'
  ];

  console.log('=== 中文智能续写测试 ===\n');
  
  for (const testCase of testCases) {
    const result = await smartCompletion.process(testCase);
    const output = smartCompletion.formatOutput(result);
    console.log(`输入: "${testCase}"`);
    console.log(`输出: "${testCase}${output}"`);
    console.log('---');
  }
}

// 如果在 Node.js 环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChineseSmartCompletion;
  
  // 运行测试
  testCompletion();
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.ChineseSmartCompletion = ChineseSmartCompletion;
} 
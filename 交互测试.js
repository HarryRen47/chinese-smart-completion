/**
 * 中文智能续写工具 - 命令行交互版本
 * 运行方式：node 交互测试.js
 */

const readline = require('readline');
const ChineseSmartCompletion = require('./智能续写引擎.js');

// 创建智能续写引擎实例
const smartCompletion = new ChineseSmartCompletion();

// 创建命令行接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// 格式化输出
function colorText(text, color = 'reset') {
    return `${colors[color]}${text}${colors.reset}`;
}

// 显示欢迎信息
function showWelcome() {
    console.clear();
    console.log(colorText('╔══════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorText('║                    🧠 中文智能续写工具                        ║', 'cyan'));
    console.log(colorText('║                      命令行交互版本                          ║', 'cyan'));
    console.log(colorText('╚══════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log();
    console.log(colorText('✨ 支持的功能：', 'yellow'));
    console.log(colorText('  📊 数学计算：1+1、25的平方根', 'white'));
    console.log(colorText('  📅 日期查询：3天后、明天', 'white'));
    console.log(colorText('  🌍 时区查询：纽约时间、东京时间', 'white'));
    console.log(colorText('  🔄 单位转换：37摄氏度等于、100米', 'white'));
    console.log(colorText('  💰 汇率换算：1美元、100人民币', 'white'));
    console.log(colorText('  📚 公式查询：牛顿第二定律、勾股定理', 'white'));
    console.log();
    console.log(colorText('💡 提示：输入 "help" 查看帮助，输入 "exit" 退出程序', 'magenta'));
    console.log(colorText('─'.repeat(60), 'cyan'));
    console.log();
}

// 显示帮助信息
function showHelp() {
    console.log(colorText('\n📖 帮助信息：', 'yellow'));
    console.log(colorText('  help    - 显示此帮助信息', 'white'));
    console.log(colorText('  clear   - 清屏', 'white'));
    console.log(colorText('  examples- 显示示例', 'white'));
    console.log(colorText('  exit    - 退出程序', 'white'));
    console.log();
}

// 显示示例
function showExamples() {
    console.log(colorText('\n🎯 示例输入：', 'yellow'));
    
    const examples = [
        { category: '数学计算', items: ['1+1', '25*4', '100的平方根'] },
        { category: '日期时间', items: ['3天后', '明天', '下周'] },
        { category: '时区查询', items: ['纽约时间', '东京时间', '伦敦时间'] },
        { category: '单位转换', items: ['37摄氏度等于', '100米', '50英尺'] },
        { category: '汇率换算', items: ['1美元', '100人民币', '50欧元'] },
        { category: '公式查询', items: ['牛顿第二定律', '勾股定理', '欧姆定律'] }
    ];

    examples.forEach(category => {
        console.log(colorText(`  ${category.category}:`, 'green'));
        category.items.forEach(item => {
            console.log(colorText(`    → ${item}`, 'white'));
        });
    });
    console.log();
}

// 处理用户输入
async function processUserInput(input) {
    const trimmedInput = input.trim();
    
    // 处理命令
    switch (trimmedInput.toLowerCase()) {
        case 'help':
        case 'h':
            showHelp();
            return;
        case 'clear':
        case 'cls':
            console.clear();
            showWelcome();
            return;
        case 'examples':
        case 'example':
            showExamples();
            return;
        case 'exit':
        case 'quit':
        case 'q':
            console.log(colorText('\n👋 谢谢使用，再见！', 'cyan'));
            process.exit(0);
        case '':
            return;
    }

    // 处理智能续写
    try {
        console.log(colorText('⏳ 处理中...', 'yellow'));
        
        const startTime = Date.now();
        const result = await smartCompletion.process(trimmedInput);
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        // 清除"处理中"提示
        process.stdout.write('\r' + ' '.repeat(20) + '\r');
        
        if (result) {
            const output = smartCompletion.formatOutput(result);
            const fullOutput = trimmedInput + output;
            
            console.log(colorText('✅ 结果：', 'green') + colorText(fullOutput, 'bright'));
            console.log(colorText(`⚡ 处理耗时：${processingTime}ms`, 'magenta'));
        } else {
            console.log(colorText('❌ 暂不支持此类型的内容', 'red'));
            console.log(colorText('💡 输入 "examples" 查看支持的示例', 'yellow'));
        }
    } catch (error) {
        process.stdout.write('\r' + ' '.repeat(20) + '\r');
        console.log(colorText(`❌ 处理出错：${error.message}`, 'red'));
    }
}

// 主循环
function startInteractiveMode() {
    showWelcome();
    
    const promptUser = () => {
        rl.question(colorText('🤖 请输入：', 'cyan'), async (input) => {
            await processUserInput(input);
            console.log(); // 添加空行
            promptUser(); // 继续下一轮输入
        });
    };
    
    promptUser();
}

// 处理程序退出
process.on('SIGINT', () => {
    console.log(colorText('\n\n👋 程序已终止，再见！', 'cyan'));
    process.exit(0);
});

// 启动交互模式
if (require.main === module) {
    startInteractiveMode();
}

module.exports = {
    startInteractiveMode,
    processUserInput
}; 
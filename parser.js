module.exports = {
    parse: parse
};


/**
 * Числовой токен
 *
 * @param {Number} number
 * @param {Number} level
 * @constructor
 */
function NumberToken(number, level)
{
    this.value = number;
    this.level = level
}

/**
 * Токен операции
 *
 * @param {string} operation
 * @param {Number} level
 * @constructor
 */
function OperationToken(operation, level)
{
    this.operation = operation;
    this.level = level
}

/**
 * Подсчет простой части выражения
 *
 * @param {Array}tokens
 * @return {number}
 */
function simpleCalc(tokens)
{
    tokens = tokens.slice();
    while (tokens.length > 1) {
        switch (tokens[1].operation) {
            case '*':
                tokens[0].value = tokens[0].value * tokens[2].value;
                tokens.splice(1,2);
                break;
            case '/':
                tokens[0].value = tokens[0].value / tokens[2].value;
                tokens.splice(1,2);
                break;
            case '+':case '-':
                if (tokens.length > 3 && (tokens[3].operation == '*' ||  tokens[3].operation == '/')) {
                    if (tokens[3].operation == '*') {
                        tokens[2].value = tokens[2].value * tokens[4].value;
                    } else {
                        tokens[2].value = tokens[2].value / tokens[4].value;
                    }

                    tokens.splice(3,2);
                } else {
                    if (tokens[1].operation == '+') {
                        tokens[0].value = tokens[0].value + tokens[2].value;
                    } else {
                        tokens[0].value = tokens[0].value - tokens[2].value;
                    }

                    tokens.splice(1,2);
                }

                break;
        }
    }

    return tokens[0].value;
}




/**
 * Разбор выражения и возврат результата
 *
 * @param {string} stringExpression Арифметическое выражение в виде строки
 *
 * @return {number}
 */
function parse(stringExpression)
{
    var lastToken = null;
    var numberStr = '';
    var level = 0;
    var tokens = [];
    var fullLength = stringExpression.length;

    var numberReg = /^-?\d+/;
    var operatorReg = /^\*|^\/|^\-|^\+|^\^/;

    while (stringExpression.length > 0) {
        if (numberReg.test(stringExpression)) {
            numberStr = numberReg.exec(stringExpression)[0];
            if (lastToken !== null && lastToken instanceof NumberToken && (1 * numberStr > 0) ) {
                throw new Error(
                        "Странная ошибка - распознано два числа (пропущен оператор?): " + (fullLength - stringExpression.length)
                        + "\n" + stringExpression
                );
            }

            stringExpression = stringExpression.substr(numberStr.length);
            if (lastToken !== null && lastToken instanceof NumberToken) {
                tokens.push(new OperationToken('-', level));
                lastToken = new NumberToken(-1 * numberStr, level);
            } else {
                lastToken = new NumberToken(1 * numberStr, level);
            }

            tokens.push(lastToken);
        } else if (operatorReg.test(stringExpression)) {
            if (lastToken !== null && (lastToken instanceof OperationToken)) {
                throw new Error("Пропущено число или выражение: " + (fullLength - stringExpression.length));
            }
            var operator = operatorReg.exec(stringExpression)[0];
            stringExpression = stringExpression.substr(operator.length);
            lastToken = new OperationToken(operator, level);
            tokens.push(lastToken);
        } else if (stringExpression.charAt(0) == '(') {
            if (lastToken !== null && lastToken instanceof NumberToken) {
                lastToken = new OperationToken('*', level);
                tokens.push(lastToken);
            }
            level++;
            stringExpression = stringExpression.substr(1);
        } else if (stringExpression.charAt(0) == ')') {
            level--;
            if (level < 0) {
                throw new Error("Ошибка разбора, неожиданная \")\" на позиции " + (fullLength - stringExpression.length));
            }

            var expressTokens = [];
            do {
                var token = tokens.pop();
                if (token.level == level + 1) {
                    expressTokens.unshift(token);
                }
            } while (token.level == level + 1 && tokens.length > 0);

            if (token.level <= level) {
                tokens.push(token);
            }

            if (expressTokens.length == 0) {
                throw new Error("Пустое выражение на позиции " + (fullLength - stringExpression.length));
            }

            if (expressTokens.length % 2 == 0) {
                throw new Error("Пропущено значение в выражении ");
            }

            lastToken = new NumberToken(simpleCalc(expressTokens), level);
            tokens.push(lastToken);
            stringExpression = stringExpression.substr(1);
        }
    }

    if (level > 0) {
        throw new Error("Не хватает закрывающихся скобок \")\"");
    }
    if (tokens.length % 2 == 0) {
        throw new Error("Пропущено значение в выражении ");
    }

    return simpleCalc(tokens);
}

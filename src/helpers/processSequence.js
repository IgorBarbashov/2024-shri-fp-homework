/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */

import {
    __,
    allPass,
    length,
    lt,
    gt,
    test,
    pipe,
    tap,
    ifElse,
    partial,
    partialRight,
    modulo,
    assoc,
    andThen,
    prop,
    concat,
    toString,
    otherwise
} from 'ramda';

import Api from '../tools/api';
const api = new Api();

const isValid = allPass([
    pipe(length, lt(__, 10)),
    pipe(length, gt(__, 2)),
    pipe(parseFloat, gt(__, 0)),
    test(/^[0-9]*\.?[0-9]+$/)
]);

const getRoundedNumber = pipe(Number, Math.round);
const getSquarePower = partialRight(Math.pow, [2]);
const getMod3 = modulo(__, 3);

const getResult = pipe(prop('result'), String);

const getBinaryApi = api.get('https://api.tech/numbers/base');
const buildGetBinaryProp = assoc('number', __, {from: 10, to: 2});
const getBinary = pipe(buildGetBinaryProp, getBinaryApi);

const getAnimal = pipe(toString, concat('https://animals.tech/'), api.get(__, {}));

const processSequence = ({value, writeLog, handleSuccess, handleError}) => {
    const log = tap(writeLog);
    const onValidationError = partial(handleError, ['ValidationError']);
    const processAnimalApiPromise = pipe(getResult, handleSuccess);
    const processBinaryApiPromise = pipe(
        getResult,
        log,
        length,
        log,
        getSquarePower,
        log,
        getMod3,
        log,
        getAnimal,
        andThen(processAnimalApiPromise)
    );

    const onValidationSuccess = pipe(
        getRoundedNumber,
        log,
        getBinary,
        andThen(processBinaryApiPromise),
        otherwise(handleError)
    );

    const run = pipe(
        log,
        ifElse(
            isValid,
            onValidationSuccess,
            onValidationError
        )
    );

    run(value);
}

export default processSequence;

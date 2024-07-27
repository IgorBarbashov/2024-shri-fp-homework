/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */

import {COLORS, SHAPES} from '../constants';

// library utils
const partial = (fn, arg) => (...args) => fn(arg, ...args);
const partialRight = (fn, arg) => (...args) => fn(...args, arg);
const omit = (obj, propName) => Object.fromEntries(Object.entries(obj).filter(([key]) => key !== propName));
const compose = (...fns) => arg => fns.reduceRight((v, fn) => fn(v), arg);
const allPass = predicates => arg => predicates.every(predicate => predicate(arg));
const anyPass = predicates => arg => predicates.some(predicate => predicate(arg));
const applyPredicateWith = (predicate, transformers) => arg => predicate(...transformers.map(t => t(arg)));

const prop = (obj, propName) => obj[propName];
const filter = (obj, arg) => Object.values(obj).filter(prop => prop === arg);
const countBy = (obj, arg) => Object.values(obj).filter(prop => prop === arg).length;
const all = (obj, arg) => Object.values(obj).every(prop => prop === arg);

const equals = (a, b) => a === b;
const not = a => !a;
const gE = (a, b) => a >= b;

// common helpers
const capitalized = str => str.charAt(0).toUpperCase() + str.slice(1);
const nums = ['One', 'Two', 'Three', 'Four'];

// math helpers
const M = nums.reduce((acc, n, i) => {
    acc[`is${n}`] = partial(equals, i + 1);
    acc[`ge${n}`] = partialRight(gE, i + 1);
    return acc;
}, {});

// shapes helpers
const S = Object.values(SHAPES).reduce((acc, shape) => {
    const capitalizedShape = capitalized(shape);
    acc[shape] = partialRight(prop, shape);
    acc[`omit${capitalizedShape}`] = partialRight(omit, shape);
    return acc;
}, {});

// colors helpers
const C = Object.values(COLORS).reduce((acc, color) => {
    const capitalizedColor = capitalized(color);
    const colorPredicateName = `is${capitalizedColor}`;
    acc[colorPredicateName] = partial(equals, color);
    acc[`filter${capitalizedColor}`] = partialRight(filter, color);
    acc[`count${capitalizedColor}`] = partialRight(countBy, color);
    acc[`isAll${capitalizedColor}`] = partialRight(all, color);
    nums.forEach(num => acc[`ge${num}${capitalizedColor}`] = compose(M[`ge${num}`], partialRight(countBy, color)));
    Object.values(SHAPES).forEach(shape => {
        const colorizedShapePredicateName = `${capitalizedColor}${capitalized(shape)}`;
        acc[`is${colorizedShapePredicateName}`] = compose(acc[colorPredicateName], S[shape]);
        acc[`isNot${colorizedShapePredicateName}`] = compose(not, acc[`is${colorizedShapePredicateName}`]);
    });
    return acc;
}, {});

// 1. Красная звезда, зеленый квадрат, все остальные белые.
export const validateFieldN1 = allPass([
    compose(C.isAllWhite, S.omitStar, S.omitSquare),
    C.isGreenSquare,
    C.isRedStar
]);

// 2. Как минимум две фигуры зеленые.
export const validateFieldN2 = compose(M.geTwo, C.countGreen);

// 3. Количество красных фигур равно кол-ву синих.
export const validateFieldN3 = applyPredicateWith(equals, [C.countRed, C.countBlue]);

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
export const validateFieldN4 =  allPass([C.isBlueCircle, C.isRedStar, C.isOrangeSquare]);

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
export const validateFieldN5 = anyPass([
    C.geThreeRed,
    C.geThreeBlue,
    C.geThreeOrange,
    C.geThreeGreen
]);

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
export const validateFieldN6 = allPass([
    compose(M.isTwo, C.countGreen),
    compose(M.geOne, C.countRed),
    C.isGreenTriangle
]);

// 7. Все фигуры оранжевые.
export const validateFieldN7 = C.isAllOrange;

// 8. Не красная и не белая звезда, остальные – любого цвета.
export const validateFieldN8 = allPass([C.isNotRedStar, C.isNotWhiteStar]);

// 9. Все фигуры зеленые.
export const validateFieldN9 = C.isAllGreen;

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
export const validateFieldN10 = allPass([
    applyPredicateWith(equals, [S.square, S.triangle]),
    C.isNotWhiteTriangle
]);

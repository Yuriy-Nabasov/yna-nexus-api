// src/utils/parseFilterParams.js

const parseNumber = (number) => {
  // Перевіряємо, чи є вхідне значення рядком і чи не порожній він
  if (typeof number !== 'string' || number.trim() === '') {
    return undefined; // Повертаємо undefined, якщо не рядок або порожній
  }

  const parsedNumber = parseInt(number, 10); // Завжди вказуйте radix 10 для parseInt
  if (Number.isNaN(parsedNumber)) {
    return undefined; // Повертаємо undefined, якщо не вдалося розпарсити
  }

  return parsedNumber;
};

export const parseFilterParams = (query) => {
  // Використовуємо деструктуризацію для зручності
  const { year, circulation, price, topic } = query; // Додано 'topic'

  const parsedYear = parseNumber(year);
  const parsedCirculation = parseNumber(circulation);
  const parsedPrice = parseNumber(price);

  return {
    year: parsedYear,
    circulation: parsedCirculation,
    price: parsedPrice,
    topic, // Додано 'topic'
  };
};

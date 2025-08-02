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

// Нова функція для парсингу дати
// const parseDate = (dateString) => {
//   // Перевіряємо, чи є вхідне значення рядком і чи не порожній він
//   if (typeof dateString !== 'string' || dateString.trim() === '') {
//     return undefined;
//   }

//   // Створюємо об'єкт Date. JavaScript може парсити ISO 8601 (YYYY-MM-DD)
//   const parsedDate = new Date(dateString);

//   // Перевіряємо, чи є дата валідною
//   // (new Date('invalid date string') поверне "Invalid Date" object)
//   if (isNaN(parsedDate.getTime())) {
//     return undefined; // Повертаємо undefined, якщо дата невалідна
//   }

//   return parsedDate;
// };

export const parseFilterParams = (query) => {
  // Використовуємо деструктуризацію для зручності
  const {
    year,
    circulation,
    price,
    // startDate,
    // minPrice,
    // maxPrice,
    // minYear,
    // maxYear,
    // minCirculation,
    // maxCirculation,
    // minStartDate,
    // maxStartDate,
  } = query;

  // Парсинг числових параметрів
  // const parsedMinYear = parseNumber(minYear);
  // const parsedMaxYear = parseNumber(maxYear);
  // const parsedMinCirculation = parseNumber(minCirculation);
  // const parsedMaxCirculation = parseNumber(maxCirculation);
  // const parsedMinPrice = parseNumber(minPrice);
  // const parsedMaxPrice = parseNumber(maxPrice);

  // Парсинг дати
  // const parsedStartDate = parseDate(startDate);
  // const parsedMinStartDate = parseDate(minStartDate);
  // const parsedMaxStartDate = parseDate(maxStartDate);

  // Якщо ви хочете фільтрувати по конкретному року/тиражу/ціні (а не діапазону)
  const parsedYear = parseNumber(year);
  const parsedCirculation = parseNumber(circulation);
  const parsedPrice = parseNumber(price);

  return {
    year: parsedYear,
    circulation: parsedCirculation,
    price: parsedPrice,
    // startDate: parsedStartDate,
    // minYear: parsedMinYear,
    // maxYear: parsedMaxYear,
    // minCirculation: parsedMinCirculation,
    // maxCirculation: parsedMaxCirculation,
    // minPrice: parsedMinPrice,
    // maxPrice: parsedMaxPrice,
    // minStartDate: parsedMinStartDate,
    // maxStartDate: parsedMaxStartDate,
  };
};

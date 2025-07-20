import { model, Schema } from 'mongoose';

const stampSchema = new Schema(
  {
    // Унікальний номер марки за каталогом Укрпошти
    'ukrposhta-number': {
      type: String, // String, бо може містити літери, наприклад, "А" або "Б" у деяких нумераціях
      required: true, // Це поле обов'язкове
      unique: true, // Кожна марка повинна мати унікальний номер Укрпошти
      trim: true, // Видаляє пробіли з початку та кінця рядка
    },
    country: {
      type: String,
      enum: ['Ukraine'],
      required: true,
      trim: true,
      default: 'Ukraine',
    },
    year: {
      type: Number, // Рік випуску
      required: true,
      min: 1840, // Перша марка світу (Black Penny) була випущена у 1840 році
      max: new Date().getFullYear(), // Максимальний рік - поточний
    },
    picture: {
      type: String, // URL зображення марки
      required: true,
      trim: true,
    },
    topic: {
      type: String, // Тематика марки (наприклад, "Козацтво", "Тварини", "Мистецтво")
      trim: true,
      default: '', // Пустий рядок, якщо тема не вказана
    },
    description: {
      type: String, // Детальний опис марки
      trim: true,
      default: '',
    },
    denomination: {
      type: String, // Номінал марки (наприклад, "0,15 krb", "10 грн", "F")
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    circulation: {
      type: Number, // Тираж марки
      min: 0,
    },
    design: {
      type: String, // Ім'я художника/дизайнера
      trim: true,
      default: '',
    },
    blok: {
      type: Boolean, // Чи є марка частиною блоку (True/False)
      default: false,
    },
    price: {
      type: Number, // Орієнтовна ринкова ціна або ціна випуску
      min: 0,
    },
  },
  {
    timestamps: true, // Додає поля `createdAt` та `updatedAt` автоматично
    versionKey: false,
    collection: 'UAPostStamps',
  },
);

export const StampsCollection = model('stamps', stampSchema);

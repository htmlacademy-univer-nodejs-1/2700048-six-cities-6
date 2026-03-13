import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { finished } from 'node:stream/promises';
import axios from 'axios';
import chalk from 'chalk';

import type { OfferTSVRow } from '../types.js';
import { FACILITIES, OFFER_TYPES, USER_TYPES } from '../types.js';
import type { RemoteOffer } from './remote-offer.js';
import { getRandomBoolean, getRandomFloat, getRandomInt, getRandomItem, getRandomSubset } from '../random.js';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function mapRandomUser() {
  const names = ['Alex', 'Sam', 'Taylor', 'Chris', 'Jordan', 'Pat', 'Morgan'];
  const name = getRandomItem(names);
  const email = `${name.toLowerCase()}${getRandomInt(1, 100)}@example.com`;

  return {
    authorName: name,
    authorEmail: email,
    authorAvatarUrl: `avatar-${name.toLowerCase()}.jpg`,
    authorPassword: `pass${getRandomInt(1000, 9999)}`,
    authorType: getRandomItem(USER_TYPES),
  } as const;
}

function createOfferRow(base: RemoteOffer): OfferTSVRow {
  const user = mapRandomUser();

  const goods = getRandomSubset(base.goods.length ? base.goods : FACILITIES);
  const images = base.images.length ? base.images : [
    'img/01.jpg',
    'img/02.jpg',
    'img/03.jpg',
    'img/04.jpg',
    'img/05.jpg',
    'img/06.jpg',
  ];

  const price = getRandomInt(100, 100000);
  const rating = getRandomFloat(1, 5, 1);
  const bedrooms = getRandomInt(1, 8);
  const maxAdults = getRandomInt(1, 10);

  const now = new Date();
  const shiftDays = getRandomInt(-30, 0);
  const postDate = new Date(now.getTime() + shiftDays * MS_IN_DAY);

  return {
    title: base.title,
    description: base.description,
    postDate: postDate.toISOString(),
    city: base.city,
    previewImage: base.previewImage,
    images,
    isPremium: getRandomBoolean() || base.isPremium,
    isFavorite: getRandomBoolean(),
    rating,
    type: base.type ?? getRandomItem(OFFER_TYPES),
    bedrooms,
    maxAdults,
    price,
    goods,
    ...user,
    latitude: base.location.latitude,
    longitude: base.location.longitude,
  };
}

function offerRowToTSV(row: OfferTSVRow): string {
  const images = row.images.join(';');
  const goods = row.goods.join(';');

  const columns = [
    row.title,
    row.description,
    row.postDate,
    row.city,
    row.previewImage,
    images,
    String(row.isPremium),
    String(row.isFavorite),
    String(row.rating),
    row.type,
    String(row.bedrooms),
    String(row.maxAdults),
    String(row.price),
    goods,
    row.authorName,
    row.authorEmail,
    row.authorAvatarUrl,
    row.authorPassword,
    row.authorType,
    String(row.latitude),
    String(row.longitude),
  ];

  return `${columns.join('\t')}\n`;
}

async function fetchRemoteOffers(url: string): Promise<RemoteOffer[]> {
  const response = await axios.get<RemoteOffer[]>(url, {
    responseType: 'json',
  });

  if (!Array.isArray(response.data)) {
    throw new Error('Ожидался массив предложений от JSON-сервера.');
  }

  return response.data;
}

export async function generateOffers(count: number, filePath: string, url: string): Promise<void> {
  if (count <= 0) {
    throw new Error('Количество генерируемых предложений должно быть положительным числом.');
  }

  const absolutePath = resolve(process.cwd(), filePath);
  // eslint-disable-next-line no-console
  console.log(chalk.bold(`Запрос данных с JSON-сервера: ${chalk.underline(url)}`));

  const baseOffers = await fetchRemoteOffers(url);
  if (baseOffers.length === 0) {
    throw new Error('JSON-server вернул пустой список предложений.');
  }

  // eslint-disable-next-line no-console
  console.log(chalk.bold(`Формирование ${count} предложений и запись в файл: ${chalk.underline(absolutePath)}`));

  const stream = createWriteStream(absolutePath, { encoding: 'utf-8' });

  for (let index = 0; index < count; index += 1) {
    const base = getRandomItem(baseOffers);
    const offerRow = createOfferRow(base);
    const line = offerRowToTSV(offerRow);

    const canContinue = stream.write(line);
    if (!canContinue) {
      await new Promise<void>((resolveDrain) => {
        stream.once('drain', () => resolveDrain());
      });
    }
  }

  stream.end();
  await finished(stream);

  // eslint-disable-next-line no-console
  console.log(chalk.bold.green(`Генерация завершена. Файл сохранён: ${absolutePath}`));
}


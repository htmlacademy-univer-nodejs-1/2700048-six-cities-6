import type { Offer } from '../types.js';
import { TSV_COLUMNS_COUNT } from './constants.js';

function parseBoolean(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  return Boolean(normalized);
}

function parseStringList(value: string): string[] {
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseOfferFromTSVLine(line: string, lineNumber: number): Offer {
  const columns = line.split('\t');
  if (columns.length !== TSV_COLUMNS_COUNT) {
    throw new Error(
      `Некорректное количество колонок: ожидалось ${TSV_COLUMNS_COUNT}, получено ${columns.length} (строка ${lineNumber}).`
    );
  }

  const [
    title,
    description,
    postDateRaw,
    city,
    previewImage,
    imagesRaw,
    isPremiumRaw,
    isFavoriteRaw,
    ratingRaw,
    type,
    bedroomsRaw,
    maxAdultsRaw,
    priceRaw,
    goodsRaw,
    authorName,
    authorEmail,
    authorAvatarUrl,
    ,
    authorType,
    latitudeRaw,
    longitudeRaw,
  ] = columns;

  const postDate = new Date(postDateRaw);
  const rating = Number(ratingRaw);
  const bedrooms = Number(bedroomsRaw);
  const maxAdults = Number(maxAdultsRaw);
  const price = Number(priceRaw);
  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);

  if (Number.isNaN(postDate.getTime())) {
    throw new Error(`Некорректная дата публикации (строка ${lineNumber}).`);
  }

  const offer: Offer = {
    title,
    description,
    postDate,
    city: city as Offer['city'],
    previewImage,
    images: parseStringList(imagesRaw),
    isPremium: parseBoolean(isPremiumRaw),
    isFavorite: parseBoolean(isFavoriteRaw),
    rating,
    type: type as Offer['type'],
    bedrooms,
    maxAdults,
    price,
    goods: parseStringList(goodsRaw) as Offer['goods'],
    host: {
      name: authorName,
      email: authorEmail,
      avatarUrl: authorAvatarUrl || undefined,
      type: authorType as Offer['host']['type'],
    },
    location: {
      latitude,
      longitude,
    },
  };

  return offer;
}


import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { OfferDocument } from './offer.model.js';
import type { OfferServiceInterface } from './offer-service.interface.js';
import type { OfferEntity } from './offer-entity.type.js';
import type { CreateOfferDto } from './dto/create-offer.dto.js';
import type { UpdateOfferDto } from './dto/update-offer.dto.js';
import type { CommentDocument } from '../comment/comment.model.js';
import type { UserServiceInterface } from '../user/user-service.interface.js';

const DEFAULT_OFFER_LIMIT = 60;
const PREMIUM_OFFER_LIMIT = 3;
const DEFAULT_OFFER_RATING = 1;

@injectable()
export class OfferService implements OfferServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.OfferModel) private readonly offerModel: mongoose.Model<OfferDocument>,
    @inject(RestServiceToken.CommentModel) private readonly commentModel: mongoose.Model<CommentDocument>,
    @inject(RestServiceToken.UserService) private readonly userService: UserServiceInterface
  ) {}

  public async create(dto: CreateOfferDto, hostId: string): Promise<OfferEntity> {
    const { location, ...rest } = dto;
    const created = await this.offerModel.create({
      ...rest,
      host: hostId,
      latitude: location.latitude,
      longitude: location.longitude,
      postDate: new Date(),
    });
    this.logger.info('New offer created', { title: dto.title });

    const populated = await this.offerModel.findById(created.id).populate('host').exec();
    if (!populated) {
      throw new Error('Failed to load freshly created offer.');
    }
    return this.enrichOne(populated, hostId);
  }

  public async findById(id: string, currentUserId?: string): Promise<OfferEntity | null> {
    const offer = await this.offerModel.findById(id).populate('host').exec();
    return offer ? this.enrichOne(offer, currentUserId) : null;
  }

  public async find(limit = DEFAULT_OFFER_LIMIT, currentUserId?: string): Promise<OfferEntity[]> {
    const offers = await this.offerModel
      .find()
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('host')
      .exec();
    return this.enrichMany(offers, currentUserId);
  }

  public async findByIds(ids: string[], currentUserId?: string): Promise<OfferEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    const offers = await this.offerModel
      .find({ _id: { $in: ids } })
      .sort({ postDate: -1 })
      .populate('host')
      .exec();
    return this.enrichMany(offers, currentUserId);
  }

  public async updateById(
    id: string,
    dto: UpdateOfferDto,
    currentUserId?: string
  ): Promise<OfferEntity | null> {
    const { location, ...rest } = dto;
    const update: Record<string, unknown> = { ...rest };
    if (location) {
      update.latitude = location.latitude;
      update.longitude = location.longitude;
    }

    const offer = await this.offerModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('host')
      .exec();
    return offer ? this.enrichOne(offer, currentUserId) : null;
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.offerModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  public async findPremiumByCity(
    city: string,
    limit = PREMIUM_OFFER_LIMIT,
    currentUserId?: string
  ): Promise<OfferEntity[]> {
    const offers = await this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('host')
      .exec();
    return this.enrichMany(offers, currentUserId);
  }

  public async exists(id: string): Promise<boolean> {
    const result = await this.offerModel.exists({ _id: id });
    return result !== null;
  }

  public async findOwnerId(id: string): Promise<string | null> {
    const offer = await this.offerModel.findById(id).select('host').exec();
    return offer ? offer.host.toString() : null;
  }

  public async updateRatingAndCommentCount(offerId: string): Promise<void> {
    const [aggregation] = await this.commentModel.aggregate<{ count: number; avgRating: number }>([
      { $match: { offerId: new this.commentModel.base.Types.ObjectId(offerId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const commentCount = aggregation?.count ?? 0;
    const rating = aggregation
      ? Math.round(aggregation.avgRating * 10) / 10
      : DEFAULT_OFFER_RATING;

    await this.offerModel
      .findByIdAndUpdate(offerId, { commentCount, rating })
      .exec();

    this.logger.info('Offer rating and comment count updated', {
      offerId,
      commentCount,
      rating,
    });
  }

  private async enrichOne(offer: OfferDocument, currentUserId?: string): Promise<OfferEntity> {
    const favorites = currentUserId ? await this.userService.findFavorites(currentUserId) : [];
    return this.attachFavorite(offer, new Set(favorites));
  }

  private async enrichMany(offers: OfferDocument[], currentUserId?: string): Promise<OfferEntity[]> {
    const favorites = currentUserId ? await this.userService.findFavorites(currentUserId) : [];
    const favoriteIds = new Set(favorites);
    return offers.map((offer) => this.attachFavorite(offer, favoriteIds));
  }

  private attachFavorite(offer: OfferDocument, favoriteIds: Set<string>): OfferEntity {
    return {
      ...offer.toObject(),
      isFavorite: favoriteIds.has(offer.id),
    } as OfferEntity;
  }
}

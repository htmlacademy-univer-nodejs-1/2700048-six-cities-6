import { inject, injectable } from 'inversify';
import type mongoose from 'mongoose';

import { RestServiceToken } from '../../rest-service.tokens.js';
import type { LoggerInterface } from '../../logger/logger.interface.js';
import type { ConfigInterface } from '../../config/config.interface.js';
import type { RestConfig } from '../../config/rest.config.js';
import type { UserDocument } from './user.model.js';
import type { UserServiceInterface } from './user-service.interface.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import { comparePassword, hashPassword } from './password.helper.js';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface,
    @inject(RestServiceToken.Config) private readonly config: ConfigInterface<RestConfig>,
    @inject(RestServiceToken.UserModel) private readonly userModel: mongoose.Model<UserDocument>
  ) {}

  public async create(dto: CreateUserDto): Promise<UserDocument> {
    const password = hashPassword(dto.password, this.config.get('salt'));
    const user = await this.userModel.create({ ...dto, password });
    this.logger.info('New user created', { email: dto.email });
    return user;
  }

  public async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    const result = await this.userModel.exists({ _id: documentId });
    return result !== null;
  }

  public verifyPassword(user: UserDocument, plainPassword: string): boolean {
    return comparePassword(plainPassword, user.password, this.config.get('salt'));
  }

  public async setAvatarPath(userId: string, avatarPath: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { avatarUrl: avatarPath }, { new: true })
      .exec();
  }

  public async addToFavorites(userId: string, offerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: offerId } },
        { new: true }
      )
      .exec();
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { favorites: offerId } },
        { new: true }
      )
      .exec();
  }

  public async findFavorites(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return [];
    }
    return user.favorites.map((id) => id.toString());
  }
}

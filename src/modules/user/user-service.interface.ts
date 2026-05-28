import type { UserDocument } from './user.model.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

export interface UserServiceInterface {
  create(dto: CreateUserDto): Promise<UserDocument>;
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  exists(documentId: string): Promise<boolean>;
  verifyPassword(user: UserDocument, plainPassword: string): boolean;
  setAvatarPath(userId: string, avatarPath: string): Promise<UserDocument | null>;
  addToFavorites(userId: string, offerId: string): Promise<UserDocument | null>;
  removeFromFavorites(userId: string, offerId: string): Promise<UserDocument | null>;
  findFavorites(userId: string): Promise<string[]>;
}

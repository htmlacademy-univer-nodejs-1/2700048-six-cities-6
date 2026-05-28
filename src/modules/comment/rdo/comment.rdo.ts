import { Expose, Transform, Type } from 'class-transformer';

import { UserRdo } from '../../user/rdo/user.rdo.js';

export class CommentRdo {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id)
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public rating!: number;

  @Expose({ name: 'author' })
  @Type(() => UserRdo)
  public user!: UserRdo;
}

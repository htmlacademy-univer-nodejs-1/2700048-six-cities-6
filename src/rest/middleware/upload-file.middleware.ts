import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import multer, { diskStorage } from 'multer';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error.js';
import type { MiddlewareInterface } from './middleware.interface.js';

const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export class UploadFileMiddleware implements MiddlewareInterface {
  private readonly upload: ReturnType<typeof multer>;

  constructor(
    private readonly uploadDirectory: string,
    private readonly fieldName: string
  ) {
    const absoluteDir = resolve(process.cwd(), this.uploadDirectory);
    mkdirSync(absoluteDir, { recursive: true });

    this.upload = multer({
      storage: diskStorage({
        destination: absoluteDir,
        filename: (_req, file, cb) => {
          const fileExtension = extension(file.mimetype) || 'bin';
          cb(null, `${nanoid()}.${fileExtension}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
          cb(new HttpError(
            StatusCodes.BAD_REQUEST,
            `Unsupported file type «${file.mimetype}». Allowed: ${ALLOWED_AVATAR_MIME_TYPES.join(', ')}.`
          ));
          return;
        }
        cb(null, true);
      },
    });
  }

  public execute(req: Request, res: Response, next: NextFunction): void {
    const handler = this.upload.single(this.fieldName);
    handler(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }
      if (!req.file) {
        next(new HttpError(
          StatusCodes.BAD_REQUEST,
          `Field «${this.fieldName}» is required and must contain a file.`
        ));
        return;
      }
      next();
    });
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as parseFileSizeString from 'filesize-parser';
import * as getRawBody from 'raw-body';
import { hasBody } from 'type-is';

// Excalidraw のフロントエンドは Content-Type ヘッダーを送信してこないので､ NestJSの rawBody が機能しない
// そのため､ Middleware で Request の raw に rawBody として Buffer を格納する
@Injectable()
export class FastifyRawParserMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    if (!hasBody(req)) {
      next();
      return;
    }

    const filesize = parseFileSizeString(
      process.env.BODY_LIMIT ?? '50mb',
    ) as number;

    getRawBody(
      req,
      {
        length: null, // avoid content lenght check: fastify will do it
        limit: filesize, // limit to avoid memory leak or DoS
        encoding: 'utf8',
      },
      (err, body: Buffer | string) => {
        if (err) {
          /**
           * the error is managed by fastify server
           * so the request object will not have any
           * `body` parsed.
           *
           * The preparsingRawBody decorates the request
           * meanwhile the `payload` is processed by
           * the fastify server.
           */
          return;
        }

        // body が string である場合は、Buffer に変換する
        if (isString(body)) {
          body = Buffer.from(body);
        }

        req['rawBody'] = body;
      },
    );

    next();
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

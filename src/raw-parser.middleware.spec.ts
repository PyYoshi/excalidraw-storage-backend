import { FastifyReply, FastifyRequest } from 'fastify';
import * as parseFileSizeString from 'filesize-parser';
import * as getRawBody from 'raw-body';
import { hasBody } from 'type-is';

import { FastifyRawParserMiddleware } from './raw-parser.middleware';

jest.mock('filesize-parser');
jest.mock('raw-body');
jest.mock('type-is');

describe('FastifyRawParserMiddleware', () => {
  let middleware: FastifyRawParserMiddleware;
  let req: Partial<FastifyRequest['raw']>;
  let res: Partial<FastifyReply['raw']>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new FastifyRawParserMiddleware();
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should be defined', () => {
    expect(new FastifyRawParserMiddleware()).toBeDefined();
  });

  it('should call next if there is no body', () => {
    (hasBody as jest.Mock).mockReturnValue(false);
    middleware.use(
      req as FastifyRequest['raw'],
      res as FastifyReply['raw'],
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('should parse raw body if there is a body', (done) => {
    (hasBody as jest.Mock).mockReturnValue(true);
    (parseFileSizeString as jest.Mock).mockReturnValue(52428800); // 50mb
    (getRawBody as jest.Mock).mockImplementation((req, options, callback) => {
      callback(null, Buffer.from('test body'));
    });

    req = { headers: { 'content-length': '9' } };

    middleware.use(
      req as FastifyRequest['raw'],
      res as FastifyReply['raw'],
      () => {
        expect(req['rawBody']).toEqual(Buffer.from('test body'));
        done();
      },
    );
  });

  it('should handle raw body parsing error', (done) => {
    (hasBody as jest.Mock).mockReturnValue(true);
    (parseFileSizeString as jest.Mock).mockReturnValue(52428800); // 50mb
    (getRawBody as jest.Mock).mockImplementation((req, options, callback) => {
      callback(new Error('Parsing error'), null);
    });

    req = { headers: { 'content-length': '9' } };

    middleware.use(
      req as FastifyRequest['raw'],
      res as FastifyReply['raw'],
      () => {
        expect(req['rawBody']).toBeUndefined();
        done();
      },
    );
  });

  it('should convert string body to Buffer', (done) => {
    (hasBody as jest.Mock).mockReturnValue(true);
    (parseFileSizeString as jest.Mock).mockReturnValue(52428800); // 50mb
    (getRawBody as jest.Mock).mockImplementation((req, options, callback) => {
      callback(null, 'test body');
    });

    req = { headers: { 'content-length': '9' } };

    middleware.use(
      req as FastifyRequest['raw'],
      res as FastifyReply['raw'],
      () => {
        expect(req['rawBody']).toEqual(Buffer.from('test body'));
        done();
      },
    );
  });
});

import { FastifyRawParserMiddleware } from './raw-parser.middleware';

describe('FastifyRawParserMiddleware', () => {
  it('should be defined', () => {
    expect(new FastifyRawParserMiddleware()).toBeDefined();
  });
});

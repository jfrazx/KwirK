declare module "iconv-lite" {
  var supportsStreams: boolean;
  var supportsNodeEncodingExtension: boolean;
  var defaultCharUnicode: string;
  var defaultCharSingleByte: string;

  function extendNodeEncodings(): void;
  function undoExtendNodeEncodings(): void;

  function decode( buffer: Buffer, encoding: string ): string;
  function encode( string: string, encoding: string ): Buffer;

  function decodeStream( encoding: string, options?: any): IconvLiteDecoderStream;
  function encodeStream( encoding: string, options?: any): IconvLiteEncoderStream;

  function getDecoder( encoding: string, options?: any ): StripBOMWrapper;
  function getEncoder( encoding: string, options?: any ): InternalEncoder;
  function getEncoder( encoding: string, options?: any ): SBCSEncoder;

  function getCodec( encoding: string ): SBCSCodec;
  function getCodec( encoding: string ): DBCSCodec;

  function encodingExists( encoding: string ): boolean;

  interface IconvLiteDecoderStream extends NodeJS.ReadWriteStream {
    new(encoding: string, options?: any): IconvLiteDecoderStream;
    conv: StripBOMWrapper | DBCSDecoder | SBCSDecoder;
  }

  interface IconvLiteEncoderStream extends NodeJS.ReadWriteStream {
    new(encoding: string, options?: any): IconvLiteEncoderStream;
    conv: SBCSEncoder | InternalEncoder | DBCSEncoder;
  }

  interface SBCSCodec extends SBCSEncoder, SBCSDecoder {}

  interface SBCSEncoder {
    encodeBuf: Buffer;
  }

  interface SBCSDecoder {
    decodeBuf: Buffer;
  }

  interface InternalEncoder {
    enc: string;
    bomAware?: boolean;
  }

  interface DBCSEncoder {
    leadSurrogate: number;
    seqObj: {};
    encodeTable: [number[]];
    encodeTableSeq: any[];
    defaultCharSingleByte: number;
  }

  interface DBCSDecoder {
    nodeIdx: number;
    prevBuf: Buffer;
    decodeTables: [number[]];
    decodeTableSeq: any[];
    defaultCharUnicode: string;
    bg18030: string;
  }

  interface DBCSCodec {
    encodingName: string;
    decodingTables: {};
    decodeTablesSeq: any[];
    defaultCharUnicode: string;
    encodeTable: {};
    encodeTableSequence: [number[]];
    defCharSB: string;
  }

  interface StripBOMWrapper {
    decoder: {
      encoding: string,
      surrogateSize: number,
      charBuffer: Buffer,
      charReceived: number,
      charLength: number
    };
    pass: boolean;
    options: {

    }
  }
}

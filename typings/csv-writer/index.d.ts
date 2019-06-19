declare module 'csv-writer' {
  export interface CsvHeader {
    id: string;
    title: string;
  }

  export interface CommonCsvStringifierParams {
    /** Default , */
    fieldDelimiter?: ',' | ';';
  }

  export interface CommonCsvWriterParams extends CommonCsvStringifierParams {
    /** Path to the CSV file to be written */
    path: string;
    /** Character encoding (default utf8) */
    encoding?: string;
    /**
     * Default: false. When true, it will append CSV records to the specified file.
     * If the file doesn't exist, it will create one.
     *
     * NOTE: A header line will not be written to the file if true is given.
     */
    append?: boolean;
  }

  export interface ObjectCsvWriterParams extends CommonCsvWriterParams {
    /**
     * Array of objects (id and title properties) or strings (field IDs).
     * A header line will be written to the file only if given as an array of objects.
     */
    header: CsvHeader[] | string[];
  }

  export interface ArrayCsvWriterParams extends CommonCsvWriterParams {
    /** Array of field titles */
    header?: string[];
  }

  export interface ObjectCsvStringifierParams extends CommonCsvStringifierParams {
    /** Array of objects (id and title properties) or strings (field IDs). */
    header: CsvHeader[] | string[];
  }

  export interface ArrayCsvStringifierParams extends CommonCsvStringifierParams {
    /** Array of field titles */
    header?: string[];
  }

  export interface CsvWriter {
    writeRecords(records: Iterable<any>): Promise<void>;
  }

  export interface CsvStringifier {
    getHeaderString(): string;
    stringifyRecords(records: any[]): string;
  }

  export function createObjectCsvWriter(params: ObjectCsvWriterParams): CsvWriter;

  export function createArrayCsvWriter(params: ArrayCsvWriterParams): CsvWriter;

  export function createObjectCsvStringifier(params: ObjectCsvStringifierParams): CsvStringifier;

  export function createArrayCsvStringifier(params: ArrayCsvStringifierParams): CsvStringifier;
}

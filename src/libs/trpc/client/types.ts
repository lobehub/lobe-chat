export type ErrorResponse = ErrorItem[];

export interface ErrorItem {
  error: {
    json: {
      code: number;
      data: Data;
      message: string;
    };
  };
}

export interface Data {
  code: string;
  httpStatus: number;
  path: string;
  stack: string;
}

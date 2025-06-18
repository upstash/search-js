export type MovieMetadata = {
  poster_link: string;
  imdb_link: string;
  popularity: number;
  vote_average: number;
  movie_id: string;
  name: string;
  release_year: number;
  vote_count: string;
};

export type Movie = {
  total: number;
  id: number | string;
  score: number;
  vector?: number[];
  metadata?: MovieMetadata | undefined;
  data?: string;
};

export enum ResultCode {
  Empty = "EMPTY",
  Success = "SUCCESS",
  UnknownError = "UNKNOWN_ERROR",
  MinLengthError = "MIN_LENGTH_ERROR",
}

export interface Result {
  code: ResultCode;
  movies: Movie[];
}

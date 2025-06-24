
export type IndexContent = {
  title: string;
  release_date: string;
  overview: string;
  genres: string;
  director: string;
  cast: string;
}

export type IndexMetadata = {
  movie_id: number;
  name: string;
  release_year: string;
  vote_average: number;
  vote_count: number;
  imdb_link: string;
  poster_link: string;
  popularity: number;
};

export type Dataset = {
  id: string
  data: object
  metadata: IndexMetadata
  vector: number[]
  sparseVector: {
    indices: number[]
    values: number[]
  }
}[]

export enum ResultCode {
  Empty = "EMPTY",
  Success = "SUCCESS",
  UnknownError = "UNKNOWN_ERROR",
  MinLengthError = "MIN_LENGTH_ERROR",
}

export interface Result {
  code: ResultCode;
  movies: { content: IndexContent, metadata: IndexMetadata, score: number }[];
}

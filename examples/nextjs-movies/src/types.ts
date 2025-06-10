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
  data: string
  metadata: IndexMetadata
  vector: number[]
  sparseVector: {
    indices: number[]
    values: number[]
  }
}[]

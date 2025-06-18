import { config } from 'dotenv';
import movies from '../app/movies.json';
import { Dataset } from '@/lib/types';
import { BATCH_SIZE, INDEX_NAME } from '@/lib/constants';

// Load environment variables
config();


async function main() {
  console.log('Starting data upsert...');

  try {
    const dataset = movies as Dataset;

    for (let index_ = 0; index_ < dataset.length; index_ += BATCH_SIZE) {
      const batch = dataset.slice(index_, index_ + BATCH_SIZE).map((data) => {
        const { data: content, ...rest } = data;
        return {
          ...rest,
          content,
        };
      });

      await fetch(
        `${process.env.UPSTASH_SEARCH_REST_URL}/upsert/${INDEX_NAME}`,
        {
          headers: {
            authorization: `Bearer ${process.env.UPSTASH_SEARCH_REST_TOKEN}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(batch),
          method: 'POST',
          keepalive: false,
        }
      );
    }
    console.log('✅ Data upserted successfully!');
  } catch (error) {
    console.error('❌ Error upserting data:', error);
    process.exit(1);
  }
}

main();
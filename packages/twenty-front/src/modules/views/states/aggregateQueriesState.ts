import { atomFamily } from 'recoil';

export type AggregateQuery = {
  filters?: Record<string, any>;
  orderBy?: Record<string, any>;
  totalCount?: number;
  // Add other aggregate fields as needed
};

export const aggregateQueriesState = atomFamily<AggregateQuery | null, string>({
  key: 'aggregateQueriesState',
  default: null,
});

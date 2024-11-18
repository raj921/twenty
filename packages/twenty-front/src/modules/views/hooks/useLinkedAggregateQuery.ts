import { useEffect } from 'react';

import { useAggregateQueries } from './useAggregateQueries';
import { generateAggregateQueryKey } from '../utils/queryKeys';
import { AggregateQuery } from '../states/aggregateQueriesState';

export const useLinkedAggregateQuery = (
  dataQueryKey: string,
  initialAggregateData?: Partial<AggregateQuery>,
) => {
  const {
    setAggregateQuery,
    getAggregateQuery,
    refreshAggregate,
    updateAggregateOptimistically,
  } = useAggregateQueries();

  const aggregateQueryKey = generateAggregateQueryKey(dataQueryKey);

  useEffect(() => {
    if (initialAggregateData) {
      setAggregateQuery(aggregateQueryKey, {
        ...getAggregateQuery(aggregateQueryKey),
        ...initialAggregateData,
      });
    }
  }, [
    aggregateQueryKey,
    initialAggregateData,
    setAggregateQuery,
    getAggregateQuery,
  ]);

  return {
    aggregateData: getAggregateQuery(aggregateQueryKey),
    refreshAggregate: () => refreshAggregate(aggregateQueryKey),
    updateAggregateOptimistically: (
      updateFn: (current: AggregateQuery) => AggregateQuery,
    ) => updateAggregateOptimistically(aggregateQueryKey, updateFn),
  };
};

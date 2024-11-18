import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

import { aggregateQueriesState, AggregateQuery } from '../states/aggregateQueriesState';

export const useAggregateQueries = () => {
  const setAggregateQuery = useRecoilCallback(
    ({ set }) =>
      (queryKey: string, query: AggregateQuery) => {
        set(aggregateQueriesState(queryKey), query);
      },
    [],
  );

  const getAggregateQuery = useRecoilCallback(
    ({ snapshot }) =>
      (queryKey: string) => {
        return snapshot.getLoadable(aggregateQueriesState(queryKey)).getValue();
      },
    [],
  );

  const refreshAggregate = useCallback(
    async (queryKey: string) => {
      const currentQuery = getAggregateQuery(queryKey);
      
      if (!currentQuery) {
        return;
      }

      // Here you would make the actual API call to fetch new aggregate data
      // For now, this is a placeholder
      const response = await fetch('/api/aggregate', {
        method: 'POST',
        body: JSON.stringify(currentQuery),
      });

      const newData = await response.json();
      setAggregateQuery(queryKey, {
        ...currentQuery,
        ...newData,
      });
    },
    [getAggregateQuery, setAggregateQuery],
  );

  const updateAggregateOptimistically = useCallback(
    (queryKey: string, updateFn: (current: AggregateQuery) => AggregateQuery) => {
      const currentQuery = getAggregateQuery(queryKey);
      
      if (!currentQuery) {
        return;
      }

      const updatedQuery = updateFn(currentQuery);
      setAggregateQuery(queryKey, updatedQuery);
    },
    [getAggregateQuery, setAggregateQuery],
  );

  return {
    setAggregateQuery,
    getAggregateQuery,
    refreshAggregate,
    updateAggregateOptimistically,
  };
};

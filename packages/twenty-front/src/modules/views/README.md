# Views Module

## Aggregate Queries

The Views module now supports separate handling of data and aggregate queries, enabling optimistic rendering and independent refresh of aggregate data.

### Key Components

1. `aggregateQueriesState`
- Recoil atom family that stores aggregate query parameters and results
- Each query is identified by a unique key generated from the data query parameters

2. `useAggregateQueries` Hook
- Manages aggregate queries state
- Provides functions for setting, getting, and refreshing aggregate data
- Supports optimistic updates

3. `useLinkedAggregateQuery` Hook
- Links data queries with their aggregate counterparts
- Manages the lifecycle of aggregate queries
- Provides easy access to aggregate data and update functions

### Usage Example

```typescript
// In a ViewBar Pill component
const ViewBarPill = ({ dataQueryKey }) => {
  const { aggregateData, refreshAggregate, updateAggregateOptimistically } = 
    useLinkedAggregateQuery(dataQueryKey);

  // Update count optimistically when adding a record
  const handleAddRecord = () => {
    updateAggregateOptimistically((current) => ({
      ...current,
      totalCount: (current.totalCount || 0) + 1,
    }));
    
    // Perform actual record addition
    addRecord().then(() => {
      // Refresh aggregate to get actual count
      refreshAggregate();
    });
  };

  return (
    <Pill>
      Total: {aggregateData?.totalCount || 0}
    </Pill>
  );
};
```

### Query Key Generation

Query keys are generated consistently to maintain the relationship between data and aggregate queries:

```typescript
// Generate a data query key
const dataQueryKey = generateQueryKey('companies', {
  filters: { status: 'active' },
  orderBy: { name: 'asc' },
});

// Generate the corresponding aggregate query key
const aggregateQueryKey = generateAggregateQueryKey(dataQueryKey);
```

### Benefits

1. **Separation of Concerns**
   - Data and aggregate queries are managed independently
   - Each query type can be refreshed separately

2. **Optimistic Updates**
   - Immediate UI feedback through optimistic updates
   - Background refresh for actual data

3. **Clean Integration**
   - Easy integration with existing components
   - Consistent query key generation
   - Type-safe aggregate data management

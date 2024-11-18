export const generateQueryKey = (
  objectName: string,
  params: Record<string, any>,
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${objectName}:${JSON.stringify(sortedParams)}`;
};

export const generateAggregateQueryKey = (dataQueryKey: string): string => {
  return `aggregate:${dataQueryKey}`;
};

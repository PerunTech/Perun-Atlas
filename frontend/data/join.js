import { reader } from './path';

export const joinStatus = (collection, rows, { featureKey, rowKey, as = 'status' }) => {
  const readRow = reader(rowKey);
  const readFeature = reader(featureKey);

  const index = new Map((rows ?? []).map(row => [String(readRow(row)), row]));

  return {
    ...collection,
    features: (collection?.features ?? []).map(feature => {
      const match = index.get(String(readFeature(feature?.properties)));
      return match
        ? { ...feature, properties: { ...feature.properties, [as]: match } }
        : feature;
    })
  };
};

import { React } from 'perun-core';
import { matchesIdentity } from '../data/feature';

const { useEffect, useState } = React;

export const useRecord = ({ subject, drawing }) => {
  const [record, setRecord] = useState(null);

  const isSubject = (feature) => matchesIdentity(feature, subject?.id, subject?.match);

  // Leaflet passes a vector click up to the map, so while the draw tool is armed the click only places
  // the shape rather than also opening a pane over it.
  const openRecord = (feature, details) => {
    if (drawing) return;
    if (details) setRecord(details);
  };

  const descriptorFor = (feature) => (subject?.descriptor && isSubject(feature) ? subject.descriptor : null);

  // The record the screen is about is the first thing a cluster would swallow.
  const isPinnedFeature = (feature) => isSubject(feature);

  // Listens on the document rather than trapping focus, so the map keeps its own keyboard handling.
  useEffect(() => {
    if (!record) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setRecord(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [record]);

  return {
    record,
    openRecord,
    closeRecord: () => setRecord(null),
    isSubject,
    descriptorFor,
    isPinnedFeature
  };
};

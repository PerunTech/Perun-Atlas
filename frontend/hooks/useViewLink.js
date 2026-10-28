import { React } from 'perun-core';
import { shownName } from '../data/tiles';
import { copyText } from '../lib/dom';
import { writeLink } from '../lib/link';

const { useEffect, useRef, useState } = React;

const COPIED_FOR = 2000;

// Only offered when the caller names the screen (`linkId`), or the copied address would open the
// record with the map shut. The view is read on press, not tracked.
export const useViewLink = ({ linkId, link, timeScoped, range, labels = {} }) => {
  const offered = linkId !== undefined && linkId !== null && linkId !== '' && link !== false;

  const mapRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copied]);

  const attach = ({ map, basemap }) => { mapRef.current = { map, basemap }; };

  const copy = async (origin) => {
    const { map, basemap } = mapRef.current ?? {};
    if (!map) return;

    const center = map.getCenter();
    const href = writeLink(window.location.href, linkId, {
      center: [center.lat, center.lng],
      zoom: map.getZoom(),
      basemap: shownName(basemap, map),
      ...(timeScoped && { from: range.from, to: range.to })
    });

    if (await copyText(href, origin?.parentNode ?? undefined)) setCopied(true);
    else window.prompt(labels.copyLinkPrompt ?? 'Copy this link:', href);
  };

  return { offered, copied, attach, copy };
};

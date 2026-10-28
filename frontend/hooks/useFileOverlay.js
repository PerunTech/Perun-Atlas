import { React } from 'perun-core';
import { FILE_LIMITS, fileKind, readFile, readLayers, sizeRefusal } from '../data/read';
import { loadModule } from '../lib/modules';
import { assumedText, refusalText } from '../lib/fileText';

const { useRef, useState } = React;

// Reading and drawing a large file hold the main thread, so the loading card is painted first.
// A timeout from inside requestAnimationFrame runs just after the paint.
const afterPaint = () => new Promise((resolve) => {
  requestAnimationFrame(() => setTimeout(resolve, 0));
});

const readPicked = async (picked) => {
  const bytes = await picked.arrayBuffer();
  const kind = fileKind(bytes, picked.name);
  if (kind === 'text') return readFile(new TextDecoder().decode(bytes));
  if (kind === 'part') return { refused: 'shapefilePart' };

  let reader;
  try {
    reader = await loadModule('shp');
  } catch (err) {
    console.warn('perun-atlas: the shapefile reader could not be loaded', err);
    return { refused: 'readerUnavailable' };
  }
  return readLayers(await reader.readShapefile(bytes, { kind, limit: FILE_LIMITS.bytes }));
};

// One file at a time, and a refused file doesn't replace the open one. Read here on pick; drawn by
// FileOverlay once the map has resolved its projection.
export const useFileOverlay = ({ overlay, labels, onChange }) => {
  const offered = overlay !== false;

  const [file, setFile] = useState(null);

  const [refusal, setRefusal] = useState(null);

  const [note, setNote] = useState(null);

  // Cleared when the overlay reports it has drawn, not when reading ends: drawing takes as long again.
  const [opening, setOpening] = useState(null);

  const inputRef = useRef(null);

  // The last pick wins, however the reads finish.
  const latest = useRef(0);

  const choose = () => inputRef.current?.click();

  const open = async (picked) => {
    const ticket = ++latest.current;

    // Known before a byte is read, so said at once with no card in between.
    let result = sizeRefusal(picked.size);
    if (!result) {
      setOpening(picked.name);
      await afterPaint();
      if (ticket !== latest.current) return;

      try {
        result = await readPicked(picked);
      } catch (err) {
        console.warn('perun-atlas: a file could not be read', err);
        result = { refused: 'unreadable' };
      }
    }
    if (ticket !== latest.current) return;

    if (result.refused) {
      setOpening(null);
      setRefusal(refusalText(result, picked.name, labels));
      return;
    }

    // `opening` stays set until the overlay reports through `drawn`.
    setRefusal(null);
    setNote(result.assumed ? assumedText(picked.name, labels) : null);
    setFile({ name: picked.name, collection: result.collection, count: result.collection.features.length });
    onChange?.();
  };

  // Emptied at once, so picking the same file again still fires `change`.
  const onPicked = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (picked) open(picked);
  };

  const close = () => {
    latest.current += 1;
    setOpening(null);
    setNote(null);
    setFile(null);
    onChange?.();
  };

  const drawn = () => setOpening(null);

  const failed = () => {
    if (!file) return;
    setRefusal(refusalText({ refused: 'unreadable' }, file.name, labels));
    close();
  };

  return {
    offered,
    file,
    refusal,
    note,
    opening,
    inputRef,
    choose,
    onPicked,
    close,
    drawn,
    failed,
    dismiss: () => setRefusal(null),
    dismissNote: () => setNote(null)
  };
};

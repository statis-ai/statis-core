"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Character-by-character typewriter across a sequence of lines.
 *
 * `startKey` drives the effect: when it changes to a non-zero value the typer
 * rewinds to the start and begins emitting. Bump it again to replay.
 * `onDone` fires once after the final line is emitted.
 */
export function useTyper(lines: string[], startKey: number, onDone?: () => void) {
  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [partial, setPartial] = useState("");
  const activeRef = useRef(false);
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (startKey === 0) {
      setDoneLines([]);
      setPartial("");
      return;
    }
    setDoneLines([]);
    setPartial("");
    lineIdxRef.current = 0;
    charIdxRef.current = 0;
    activeRef.current = true;

    function advance() {
      if (!activeRef.current) return;
      const li = lineIdxRef.current;
      if (li >= lines.length) {
        activeRef.current = false;
        setPartial("");
        onDoneRef.current?.();
        return;
      }
      const line = lines[li];
      if (line === "") {
        setDoneLines((p) => [...p, ""]);
        lineIdxRef.current++;
        charIdxRef.current = 0;
        setTimeout(advance, 60);
        return;
      }
      charIdxRef.current++;
      const ci = charIdxRef.current;
      setPartial(line.slice(0, ci));
      if (ci >= line.length) {
        setDoneLines((p) => [...p, line]);
        setPartial("");
        lineIdxRef.current++;
        charIdxRef.current = 0;
        setTimeout(advance, 100);
      } else {
        setTimeout(advance, 22 + Math.random() * 18);
      }
    }
    advance();
    return () => {
      activeRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startKey]);

  return { doneLines, partial };
}

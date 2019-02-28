import { Tag, Interval } from './';

export const sizeInterval = (
  lines: Array<
    Array<{
      id: number;
      time_start: number;
      time_end: number;
      took: boolean;
      intersectors: Interval[];
      tags: Tag[];
    }>
  >
): Array<
  Array<{
    id: number;
    time_start: number;
    time_end: number;
    took: boolean;
    intersectors: Interval[];
    tags: Tag[];
    additionnalBlock: number;
  }>
> => {
  // iterating over all lines
  return lines.map((currentLine, lineIndex, allLines) => {
    // iterating over all intervals in the current line
    return currentLine.map(currentInterval => {
      let additionnalBlock = 0; // this represents the additionnal "block" the interval will take in the display
      // iterating over all lines after the current one
      for (let i = lineIndex + 1; i < allLines.length; i++) {
        const lineIntervals = allLines[i];

        // if the current interval doesn't intersect this line, it can take one more block
        if (intersectInLine(lineIntervals, currentInterval.intersectors)) {
          additionnalBlock = i - lineIndex - 1;
          return { ...currentInterval, additionnalBlock };
        }
      }
      return {
        ...currentInterval,
        additionnalBlock: allLines.length - lineIndex - 1
      };
    });
  });
};

// for each interval in lineInterval, return true if the interval is in the intersectors
const intersectInLine = (
  lineIntervals: any[],
  intersectors: any[]
): boolean => {
  for (const lineInterval of lineIntervals) {
    for (const intersector of intersectors) {
      if (intersector.id === lineInterval.id) {
        return true;
      }
    }
  }
  return false;
};

export const orderIntervals = (
  intervals: Array<{
    id: number;
    time_start: number;
    time_end: number;
    took: boolean;
    intersectors: Interval[];
    tags: Tag[];
  }>
): Array<
  Array<{
    id: number;
    time_start: number;
    time_end: number;
    took: boolean;
    intersectors: Interval[];
    tags: Tag[];
  }>
> => {
  let sorted = sortByStartTime(intervals);
  const lines = [];
  while (sorted.length !== 0) {
    const l = [sorted.shift()!];
    let limit = l[0].time_end;
    for (const inter of sorted) {
      if (limit <= inter.time_start) {
        limit = inter.time_end;
        sorted = sorted.filter(s => s.id !== inter.id);
        l.push(inter);
      }
    }
    lines.push(l);
  }
  return lines;
};

const sortByStartTime = (
  intervals: Array<{
    id: number;
    time_start: number;
    time_end: number;
    took: boolean;
    intersectors: Interval[];
    tags: Tag[];
  }>
) => {
  return intervals.sort((a, b) => {
    const aSize = a.time_end - a.time_start;
    const bSize = b.time_end - b.time_start;
    if (a.time_start < b.time_start) {
      return -1;
    } else if (aSize > bSize) {
      return 1;
    } else return 0;
  });
};

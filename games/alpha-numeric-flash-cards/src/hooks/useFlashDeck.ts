'use client';

import { useCallback, useMemo, useState } from "react";
import { CardMode, cardsForMode } from "@/data/cards";
import { shuffle } from "@/lib/shuffle";

export function useFlashDeck(mode: CardMode) {
  const [seed, setSeed] = useState(() => Date.now());
  const [index, setIndex] = useState(0);

  const deck = useMemo(() => {
    const cards = cardsForMode(mode);
    return shuffle(cards, seed);
  }, [mode, seed]);

  const currentCard = deck[index % deck.length];

  const advance = useCallback(() => {
    setIndex((prev) => {
      if (prev + 1 >= deck.length) {
        setSeed(Date.now());
        return 0;
      }
      return prev + 1;
    });
  }, [deck.length]);

  const reshuffle = useCallback(() => {
    setSeed(Date.now());
    setIndex(0);
  }, []);

  return {
    deck,
    currentCard,
    position: (index % deck.length) + 1,
    total: deck.length,
    advance,
    reshuffle,
  };
}

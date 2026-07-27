import { Share } from "react-native";
import { standings } from "./scoring";
import type { GameAward } from "./stats";
import type { Game } from "./types";
import type { Strings } from "./i18n/types";
import { DEPLOYED_PWA_BASE_URL } from "./shareLink";

export const APP_URL = DEPLOYED_PWA_BASE_URL;

export type ShareRecapOutcome =
  | "file-shared"
  | "text-shared"
  | "copied-downloaded"
  | "copied"
  | "downloaded"
  | "cancelled";

export interface ShareRecapContent {
  game: Game;
  awards: readonly GameAward[];
  strings: Strings;
  locale: string;
  rtl: boolean;
}

interface PreparedShare {
  title: string;
  text: string;
  png: Blob | null;
  filename: string;
}

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

function recapDate(game: Game, locale: string): string {
  return new Date(game.updatedAt).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function recapFilename(game: Game): string {
  const date = new Date(game.updatedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `skull-king-recap-${year}-${month}-${day}.png`;
}

/** Native uses the same localized standings and awards recap as the web app. */
export function buildShareRecapText({
  game,
  awards,
  strings,
  locale,
}: ShareRecapContent): string {
  const rows = standings(game);
  const lines = [
    strings.share.summaryTitle,
    strings.share.gameDate(recapDate(game, locale)),
    "",
    ...rows.map((row) =>
      strings.share.rankingLine(
        medal(row.rank),
        row.player.name,
        row.total
      )
    ),
  ];

  if (awards.length > 0) {
    lines.push(
      "",
      strings.share.awardsHeading,
      ...awards.map((award) =>
        strings.share.awardLine(
          strings.awards.names[award.kind],
          award.playerName
        )
      )
    );
  }

  lines.push("", APP_URL);
  return lines.join("\n");
}

/**
 * ResultsScreen already falls back to text when PNG rendering rejects. Native
 * has no browser canvas, so take that established path intentionally.
 */
export async function renderShareRecapPng(
  _content: ShareRecapContent
): Promise<Blob> {
  throw new Error("PNG recap rendering is unavailable on native");
}

export function prepareShareRecap(
  content: ShareRecapContent,
  png: Blob | null
): PreparedShare {
  return {
    title: content.strings.share.summaryTitle,
    text: buildShareRecapText(content),
    png,
    filename: recapFilename(content.game),
  };
}

/** Present the native system share sheet with the localized text recap. */
export async function sharePreparedRecap({
  title,
  text,
}: PreparedShare): Promise<ShareRecapOutcome> {
  const result = await Share.share({ title, message: text });
  return result.action === Share.dismissedAction ? "cancelled" : "text-shared";
}

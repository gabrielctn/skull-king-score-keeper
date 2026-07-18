import { standings } from "./scoring";
import {
  cumulativeScoreSeries,
  GameAward,
} from "./stats";
import { colors, scoreSeriesColors } from "./theme";
import { Game } from "./types";
import type { Strings } from "./i18n/types";

export const APP_URL =
  "https://gabrielctn.github.io/skull-king-score-keeper/";

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

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data?: ShareData) => Promise<void>;
};

const FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

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

function fitText(
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number
): string {
  if (ctx.measureText(value).width <= maxWidth) return value;
  const chars = Array.from(value);
  while (chars.length > 1) {
    chars.pop();
    const candidate = `${chars.join("")}…`;
    if (ctx.measureText(candidate).width <= maxWidth) return candidate;
  }
  return "…";
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPodium(
  ctx: CanvasRenderingContext2D,
  game: Game,
  strings: Strings
) {
  const top = standings(game).slice(0, 3);
  const visual = [top[1], top[0], top[2]];
  const centers = [270, 540, 810];
  const bottom = 590;
  const heights: Record<number, number> = { 1: 190, 2: 155, 3: 130 };

  ctx.textAlign = "center";
  ctx.fillStyle = colors.gold;
  ctx.font = `800 32px ${FONT_STACK}`;
  ctx.fillText(strings.results.podiumTitle, 540, 295);

  visual.forEach((row, index) => {
    if (!row) return;
    const height = heights[row.rank] ?? 90;
    const x = centers[index] - 120;
    const y = bottom - height;

    ctx.fillStyle = index === 1 ? colors.card : colors.bgElevated;
    ctx.strokeStyle = row.rank === 1 ? colors.gold : colors.cardBorder;
    ctx.lineWidth = 4;
    roundedRect(ctx, x, y, 240, height, 22);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 42px ${FONT_STACK}`;
    ctx.fillStyle = colors.text;
    ctx.fillText(
      medal(row.rank),
      centers[index],
      y + Math.min(50, height * 0.32)
    );
    ctx.font = `800 28px ${FONT_STACK}`;
    ctx.fillText(
      fitText(ctx, row.player.name, 205),
      centers[index],
      y + Math.min(96, height * 0.62)
    );
    ctx.font = `800 30px ${FONT_STACK}`;
    ctx.fillStyle = row.total >= 0 ? colors.positive : colors.negative;
    ctx.fillText(String(row.total), centers[index], y + height - 18);
  });
}

function drawMiniChart(
  ctx: CanvasRenderingContext2D,
  game: Game,
  strings: Strings
) {
  const series = cumulativeScoreSeries(game);
  const roundNumbers = Array.from(
    new Set(series.flatMap((item) => item.points.map((point) => point.roundNumber)))
  ).sort((a, b) => a - b);
  if (roundNumbers.length < 2) return;

  const left = 100;
  const top = 675;
  const width = 880;
  const height = 235;
  const values = [0, ...series.flatMap((item) => item.points.map((point) => point.total))];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 10;
    max += 10;
  } else {
    const padding = Math.max(10, (max - min) * 0.08);
    min -= padding;
    max += padding;
  }

  const firstRound = roundNumbers[0];
  const lastRound = roundNumbers[roundNumbers.length - 1];
  const xFor = (round: number) =>
    left + ((round - firstRound) / Math.max(1, lastRound - firstRound)) * width;
  const yFor = (value: number) => top + height - ((value - min) / (max - min)) * height;

  ctx.textAlign = "left";
  ctx.fillStyle = colors.gold;
  ctx.font = `800 30px ${FONT_STACK}`;
  ctx.fillText(strings.stats.scoreEvolution, left, top - 28);

  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, yFor(0));
  ctx.lineTo(left + width, yFor(0));
  ctx.stroke();

  series.forEach((item, index) => {
    if (item.points.length < 2) return;
    ctx.strokeStyle = scoreSeriesColors[index % scoreSeriesColors.length];
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    item.points.forEach((point, pointIndex) => {
      const x = xFor(point.roundNumber);
      const y = yFor(point.total);
      if (pointIndex === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  ctx.fillStyle = colors.textDim;
  ctx.font = `600 20px ${FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.fillText(String(firstRound), left, top + height + 28);
  ctx.textAlign = "end";
  ctx.fillText(String(lastRound), left + width, top + height + 28);
}

function drawAwards(
  ctx: CanvasRenderingContext2D,
  awards: readonly GameAward[],
  strings: Strings
) {
  if (awards.length === 0) return;
  ctx.textAlign = "left";
  ctx.fillStyle = colors.gold;
  ctx.font = `800 30px ${FONT_STACK}`;
  ctx.fillText(strings.awards.title, 100, 990);

  ctx.font = `700 24px ${FONT_STACK}`;
  awards.forEach((award, index) => {
    const y = 1035 + index * 42;
    ctx.fillStyle = colors.text;
    const line = strings.share.awardLine(
      strings.awards.names[award.kind],
      award.playerName
    );
    ctx.fillText(fitText(ctx, `✦ ${line}`, 880), 100, y);
  });
}

export async function renderShareRecapPng({
  game,
  awards,
  strings,
  locale,
  rtl,
}: ShareRecapContent): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Canvas rendering requires a browser document");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");

  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.gold;
  ctx.font = `900 68px ${FONT_STACK}`;
  ctx.fillText(strings.home.title, 540, 105);
  ctx.fillStyle = colors.text;
  ctx.font = `700 34px ${FONT_STACK}`;
  ctx.fillText(strings.home.subtitle, 540, 152);
  ctx.fillStyle = colors.textDim;
  ctx.font = `600 25px ${FONT_STACK}`;
  ctx.fillText(strings.share.gameDate(recapDate(game, locale)), 540, 210);

  drawPodium(ctx, game, strings);
  drawMiniChart(ctx, game, strings);
  drawAwards(ctx, awards, strings);

  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 1260);
  ctx.lineTo(980, 1260);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = colors.textDim;
  ctx.font = `600 21px ${FONT_STACK}`;
  ctx.fillText(APP_URL, 540, 1308);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas PNG encoding failed"));
    }, "image/png");
  });
}

function isAbortError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name?: unknown }).name === "AbortError"
  );
}

async function copyRecapText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy selection-based copy path.
    }
  }

  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand("copy") === true;
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

function downloadRecapPng(blob: Blob, filename: string): boolean {
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return false;
  }
  let url: string | null = null;
  let anchor: HTMLAnchorElement | null = null;
  try {
    url = URL.createObjectURL(blob);
    anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    // Let the browser consume the URL before releasing it. Immediate
    // revocation can cancel downloads in some WebKit versions.
    const releaseUrl = url;
    setTimeout(() => {
      try {
        URL.revokeObjectURL(releaseUrl);
      } catch {
        // The download already started; URL cleanup is best effort.
      }
    }, 0);
    url = null;
    return true;
  } catch {
    return false;
  } finally {
    try {
      anchor?.remove();
    } catch {
      // A detached/hostile DOM node must not change the fallback outcome.
    }
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Best-effort cleanup after a failed download attempt.
      }
    }
  }
}

async function copyAndDownload({
  text,
  png,
  filename,
}: Pick<PreparedShare, "text" | "png" | "filename">): Promise<ShareRecapOutcome> {
  const copyPromise = copyRecapText(text).catch(() => false);
  const downloaded = png ? downloadRecapPng(png, filename) : false;
  const copied = await copyPromise;

  if (copied && downloaded) return "copied-downloaded";
  if (copied) return "copied";
  if (downloaded) return "downloaded";
  throw new Error("No recap sharing fallback is available");
}

/**
 * Share already-prepared recap data. The first Web Share invocation happens
 * synchronously before this function's first await, preserving click activation.
 */
export async function sharePreparedRecap({
  title,
  text,
  png,
  filename,
}: PreparedShare): Promise<ShareRecapOutcome> {
  const nav =
    typeof navigator === "undefined" ? null : (navigator as ShareNavigator);
  let sharePromise: Promise<void> | null = null;
  let fileShareInvoked = false;

  if (nav?.share) {
    if (png && typeof File !== "undefined") {
      try {
        const file = new File([png], filename, { type: "image/png" });
        if (typeof nav.canShare === "function" && nav.canShare({ files: [file] })) {
          fileShareInvoked = true;
          sharePromise = Promise.resolve(
            nav.share({ title, text, files: [file] })
          );
        }
      } catch (error) {
        if (fileShareInvoked) {
          if (isAbortError(error)) return "cancelled";
          return await copyAndDownload({ text, png, filename });
        }
        // Capability/File construction failure leaves the text-share branch valid.
      }
    }

    if (!fileShareInvoked) {
      try {
        sharePromise = Promise.resolve(nav.share({ title, text }));
      } catch (error) {
        if (isAbortError(error)) return "cancelled";
        return await copyAndDownload({ text, png, filename });
      }
    }
  }

  if (sharePromise) {
    try {
      await sharePromise;
      return fileShareInvoked ? "file-shared" : "text-shared";
    } catch (error) {
      if (isAbortError(error)) return "cancelled";
      return await copyAndDownload({ text, png, filename });
    }
  }

  return await copyAndDownload({ text, png, filename });
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

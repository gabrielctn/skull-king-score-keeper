import { readFileSync } from "node:fs";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}

async function main() {
  const modulePath = "../src/responsive";
  let responsive:
    | {
        getResponsiveLayout: (width: number) => {
          isTablet: boolean;
          isDesktop: boolean;
          contentMaxWidth: number;
          formMaxWidth: number;
          gameContentMaxWidth: number;
          gameColumns: 1 | 2;
          screenPadding: number;
        };
      }
    | null = null;

  try {
    responsive = await import(modulePath);
  } catch (error) {
    check(
      "responsive layout module exists",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  if (responsive) {
    const phone = responsive.getResponsiveLayout(390);
    check("phone remains single-column", phone.gameColumns === 1);
    check("phone keeps full available width", phone.contentMaxWidth === 390);
    check("phone uses compact padding", phone.screenPadding === 16);

    const tablet = responsive.getResponsiveLayout(820);
    check("tablet centers content", tablet.isTablet && !tablet.isDesktop);
    check("tablet keeps game entry single-column", tablet.gameColumns === 1);
    check("tablet form width is bounded", tablet.formMaxWidth === 640);

    const desktop = responsive.getResponsiveLayout(1280);
    check("desktop mode activates", desktop.isDesktop);
    check("desktop game entry uses two columns", desktop.gameColumns === 2);
    check("desktop game content is bounded", desktop.gameContentMaxWidth === 1180);
    check("desktop home/results content is bounded", desktop.contentMaxWidth === 980);
  }

  const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
  check(
    "home decorative layer avoids deprecated pointerEvents prop",
    !homeSource.includes(" pointerEvents=")
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

void main();

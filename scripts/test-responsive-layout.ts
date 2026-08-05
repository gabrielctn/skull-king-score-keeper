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

    // A breakpoint's ceiling must never exceed the window that triggered it.
    // GameScreen turns gameContentMaxWidth into a real header width, so an
    // unclamped ceiling renders wider than the screen and clips both edges.
    const widths = [320, 375, 700, 719, 759, 1024, 1179, 1280, 2560];
    for (const width of widths) {
      const layout = responsive.getResponsiveLayout(width);
      check(
        `every width ceiling fits a ${width}px window`,
        layout.contentMaxWidth <= width &&
          layout.formMaxWidth <= width &&
          layout.gameContentMaxWidth <= width,
        `content=${layout.contentMaxWidth} form=${layout.formMaxWidth} game=${layout.gameContentMaxWidth}`
      );
    }
  }

  const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
  check(
    "home decorative layer avoids deprecated pointerEvents prop",
    !homeSource.includes(" pointerEvents=")
  );

  // react-native-web seeds an Image's style with the asset's intrinsic size and
  // ignores undefined overrides, so the full-bleed texture must claim its size
  // explicitly or it renders as a 640px square that overflows phone viewports.
  const appSource = readFileSync("App.tsx", "utf8");
  const textureStyle = appSource.slice(
    appSource.indexOf("backgroundTexture: {"),
    appSource.indexOf("loader: {")
  );
  check(
    "background texture claims an explicit full-bleed size",
    textureStyle.includes('width: "100%"') && textureStyle.includes('height: "100%"'),
    "undefined width/height is a no-op on react-native-web"
  );

  // `body { overflow: hidden }` alone does not contain the document: the
  // viewport merely inherits it while `html` stays visible, so a too-wide child
  // still lets a phone pinch-zoom-out pan sideways into empty space.
  const templatePath = "public/index.html";
  const template = readFileSync(templatePath, "utf8");
  check(
    "web template clips document-level overflow on html",
    /html\s*\{[^}]*overflow:\s*hidden/.test(template),
    `${templatePath} must keep the html overflow guard`
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

void main();

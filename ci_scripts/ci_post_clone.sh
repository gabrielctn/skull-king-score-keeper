#!/bin/sh
#
# Xcode Cloud runs this immediately after cloning, before it resolves the
# workspace. The ios/ project is deliberately not in the repository (see
# .gitignore): it is generated from app.json plus the native sources under
# native/ios/ by `expo prebuild`, so CI has to generate it here or the build
# fails with "Workspace SkullKingScoreKeeper.xcworkspace does not exist".
set -e

cd "$CI_PRIMARY_REPOSITORY_PATH"

# Xcode Cloud images ship Homebrew but no Node.
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

npm ci

# app.json carries a static buildNumber, so every archive would reuse it and
# App Store Connect rejects a build number it has already seen. CI_BUILD_NUMBER
# is unique per Xcode Cloud build, so stamp it in before prebuild bakes the
# value into Info.plist.
if [ -n "$CI_BUILD_NUMBER" ]; then
  node -e '
    const fs = require("fs");
    const config = JSON.parse(fs.readFileSync("app.json", "utf8"));
    config.expo.ios.buildNumber = String(process.env.CI_BUILD_NUMBER);
    fs.writeFileSync("app.json", JSON.stringify(config, null, 2) + "\n");
  '
fi

# Generates ios/SkullKingScoreKeeper.xcworkspace, the shared scheme, and runs
# pod install.
npx expo prebuild --platform ios --clean

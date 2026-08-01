#!/bin/sh
#
# Xcode Cloud runs this immediately after cloning, before it resolves the
# workspace. The generated project is not tracked (see .gitignore): it is built
# from app.json plus the native sources under native/ios/ by `expo prebuild`,
# so CI has to generate it here or the build fails with "Workspace
# SkullKingCrewLedger.xcworkspace does not exist".
#
# The script has to live next to the Xcode project, which is why it sits under
# ios/ while everything else there is generated and ignored. Xcode Cloud starts
# it with ci_scripts as the working directory.
set -e

cd "${CI_PRIMARY_REPOSITORY_PATH:-$CI_WORKSPACE}"

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

# Generates ios/SkullKingCrewLedger.xcworkspace, the shared scheme and the
# Pods. Deliberately not --clean: that would delete ios/, and with it the
# directory this script is running from.
npx expo prebuild --platform ios

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  IOSConfig,
  withPodfileProperties,
  withXcodeProject,
} = require("@expo/config-plugins");

const IOS_DEPLOYMENT_TARGET = "16.0";
const NATIVE_SOURCE_FILES = [
  "AppIntents/SkullKingScoreKeeperDestination.swift",
  "AppIntents/SkullKingScoreKeeperIntents.swift",
  "AppIntents/SkullKingScoreKeeperAppShortcuts.swift",
  "IntentBridge/SkullKingScoreKeeperDestinationStore.swift",
  "IntentBridge/SkullKingScoreKeeperAppIntents.swift",
  "IntentBridge/SkullKingScoreKeeperAppIntentsBridge.m",
];

function copyNativeSources(projectRoot, platformProjectRoot, sourceRootName) {
  const trackedRoot = path.join(projectRoot, "native", "ios");
  const generatedRoot = path.join(
    platformProjectRoot,
    sourceRootName,
    "SkullKingScoreKeeperAppIntents"
  );

  for (const relativePath of NATIVE_SOURCE_FILES) {
    const sourcePath = path.join(trackedRoot, relativePath);
    const destinationPath = path.join(generatedRoot, relativePath);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(
        `[withSkullKingScoreKeeperAppIntents] Missing native source: ${sourcePath}`
      );
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function addNativeSourcesToProject(
  project,
  sourceRootName,
  targetUuid
) {
  for (const relativePath of NATIVE_SOURCE_FILES) {
    const sourceDirectory = path.dirname(relativePath);
    const groupName = [
      sourceRootName,
      "SkullKingScoreKeeperAppIntents",
      sourceDirectory,
    ].join("/");
    const generatedRelativePath = [
      sourceRootName,
      "SkullKingScoreKeeperAppIntents",
      relativePath,
    ].join("/");

    IOSConfig.XcodeUtils.ensureGroupRecursively(project, groupName);
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: generatedRelativePath,
      groupName,
      project,
      targetUuid,
    });
  }
}

function withSkullKingScoreKeeperAppIntents(config) {
  config = withPodfileProperties(config, (podfileConfig) => {
    podfileConfig.modResults["ios.deploymentTarget"] = IOS_DEPLOYMENT_TARGET;
    return podfileConfig;
  });

  config = withXcodeProject(config, (xcodeConfig) => {
    const project = xcodeConfig.modResults;
    const { projectRoot, platformProjectRoot, projectName } =
      xcodeConfig.modRequest;
    const [targetUuid, nativeTarget] =
      IOSConfig.Target.findFirstNativeTarget(project);
    const targetName = IOSConfig.XcodeUtils.unquote(
      String(nativeTarget.name)
    );
    const sourceRootName = project.pbxGroupByName(projectName)
      ? projectName
      : targetName;

    copyNativeSources(projectRoot, platformProjectRoot, sourceRootName);
    addNativeSourcesToProject(project, sourceRootName, targetUuid);
    project.updateBuildProperty(
      "IPHONEOS_DEPLOYMENT_TARGET",
      IOS_DEPLOYMENT_TARGET,
      undefined,
      targetName
    );

    xcodeConfig.modResults = project;
    return xcodeConfig;
  });

  return config;
}

module.exports = withSkullKingScoreKeeperAppIntents;
module.exports.IOS_DEPLOYMENT_TARGET = IOS_DEPLOYMENT_TARGET;
module.exports.NATIVE_SOURCE_FILES = NATIVE_SOURCE_FILES;

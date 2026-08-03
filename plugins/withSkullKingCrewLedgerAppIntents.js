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
  "AppIntents/SkullKingCrewLedgerDestination.swift",
  "AppIntents/SkullKingCrewLedgerIntents.swift",
  "AppIntents/SkullKingCrewLedgerAppShortcuts.swift",
  "IntentBridge/SkullKingCrewLedgerDestinationStore.swift",
  "IntentBridge/SkullKingCrewLedgerAppIntents.swift",
  "IntentBridge/SkullKingCrewLedgerAppIntentsBridge.m",
];

function copyNativeSources(projectRoot, platformProjectRoot, sourceRootName) {
  const trackedRoot = path.join(projectRoot, "native", "ios");
  const generatedRoot = path.join(
    platformProjectRoot,
    sourceRootName,
    "SkullKingCrewLedgerAppIntents"
  );

  for (const relativePath of NATIVE_SOURCE_FILES) {
    const sourcePath = path.join(trackedRoot, relativePath);
    const destinationPath = path.join(generatedRoot, relativePath);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(
        `[withSkullKingCrewLedgerAppIntents] Missing native source: ${sourcePath}`
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
      "SkullKingCrewLedgerAppIntents",
      sourceDirectory,
    ].join("/");
    const generatedRelativePath = [
      sourceRootName,
      "SkullKingCrewLedgerAppIntents",
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

function withSkullKingCrewLedgerAppIntents(config) {
  const marketingVersion = config.ios?.version ?? config.version;
  const buildNumber = config.ios?.buildNumber;

  if (!marketingVersion || !buildNumber) {
    throw new Error(
      "[withSkullKingCrewLedgerAppIntents] Expo version and iOS buildNumber are required"
    );
  }

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
    project.updateBuildProperty(
      "MARKETING_VERSION",
      marketingVersion,
      undefined,
      targetName
    );
    project.updateBuildProperty(
      "CURRENT_PROJECT_VERSION",
      buildNumber,
      undefined,
      targetName
    );

    xcodeConfig.modResults = project;
    return xcodeConfig;
  });

  return config;
}

module.exports = withSkullKingCrewLedgerAppIntents;
module.exports.IOS_DEPLOYMENT_TARGET = IOS_DEPLOYMENT_TARGET;
module.exports.NATIVE_SOURCE_FILES = NATIVE_SOURCE_FILES;

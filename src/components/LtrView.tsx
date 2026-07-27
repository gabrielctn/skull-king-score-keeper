import React from "react";
import { Platform, View, ViewProps } from "react-native";

/**
 * A View whose subtree always lays out left-to-right, whatever the UI language.
 *
 * Almost everything should mirror under Arabic, but a couple of views encode
 * meaning in horizontal position and must not: the score chart's rounds ascend
 * to the right, and the podium reads silver, gold, bronze.
 *
 * The two platforms disagree on how to ask for this. React Native takes a
 * `direction` style, which React Native Web rejects outright — its StyleSheet
 * validator deletes the property and logs an error on every render in
 * development, while a production build keeps it, so the same code behaves
 * differently in the two builds. On web the supported route is the DOM `dir`
 * attribute, which react-native-web forwards. Both inherit down the tree, so
 * wrapping the outermost affected container is enough.
 */

const isWeb = Platform.OS === "web";

// `dir` is a DOM attribute react-native-web forwards to the underlying
// element; it is not part of React Native's own prop types.
const webDirProps = { dir: "ltr" } as unknown as ViewProps;

export default function LtrView({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      {...(isWeb ? webDirProps : null)}
      style={isWeb ? style : [{ direction: "ltr" }, style]}
    />
  );
}

import { ImageSourcePropType } from "react-native";

export const illustrations = {
  skullKing: require("../../assets/illustrations/skull-king.png") as ImageSourcePropType,
  compass: require("../../assets/illustrations/compass.png") as ImageSourcePropType,
  parrot: require("../../assets/illustrations/parrot.png") as ImageSourcePropType,
  mermaid: require("../../assets/illustrations/mermaid.png") as ImageSourcePropType,
  treasureChest: require("../../assets/illustrations/treasure-chest.png") as ImageSourcePropType,
} as const;

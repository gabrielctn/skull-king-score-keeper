import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { colors, radius, spacing } from "../theme";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";
import { Entry } from "../i18n/types";
import { getResponsiveLayout } from "../responsive";

interface Props {
  visible: boolean;
  onClose: () => void;
}

function Section({ heading, entries }: { heading: string; entries: Entry[] }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.heading}>{heading}</Text>
      {entries.map((e) => (
        <View key={e.title} style={styles.entry}>
          <Text style={styles.entryTitle}>{e.title}</Text>
          <Text style={styles.entryBody}>{e.body}</Text>
        </View>
      ))}
    </View>
  );
}

export default function RulesModal({ visible, onClose }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, layout.isTablet && styles.backdropWide]}>
        <View style={[styles.sheet, layout.isTablet && styles.sheetWide]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.mermaidCrop}>
                <Image
                  source={illustrations.mermaid}
                  style={styles.mermaid}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>{t.rules.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>{t.rules.done}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Section heading={t.rules.headings.scoring} entries={t.rules.scoring} />
            <Section heading={t.rules.headings.bonus} entries={t.rules.bonusEntries} />
            <Section heading={t.rules.headings.special} entries={t.rules.special} />
            <Section heading={t.rules.headings.twoPlayer} entries={t.rules.twoPlayer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  backdropWide: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sheetWide: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "86%",
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mermaidCrop: {
    width: 42,
    height: 48,
    overflow: "hidden",
    alignItems: "center",
  },
  mermaid: {
    position: "absolute",
    top: -3,
    width: 82,
    height: 102,
  },
  title: { color: colors.gold, fontSize: 20, fontWeight: "800" },
  close: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  closeText: { color: colors.gold, fontSize: 16, fontWeight: "700" },
  scroll: { padding: spacing.md },
  heading: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  entry: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  entryBody: { color: colors.textDim, fontSize: 13, lineHeight: 18 },
});

import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { cloudBackupManager } from "../cloudSync";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";

interface Props {
  /** Join code consumed from a scanned link; null hides the modal. */
  code: string | null;
  onClose: () => void;
  /** Adopt + merge (the App-level link flow); resolves when done. */
  onJoin: (code: string) => Promise<number | null>;
}

type Phase =
  | { kind: "loading" }
  | { kind: "preview"; tableName: string | null; gameCount: number }
  | { kind: "joining"; tableName: string | null }
  | { kind: "joined"; tableName: string | null }
  | { kind: "error" };

/**
 * Confirmation sheet for a scanned table invite. Joining another table
 * replaces this device's cloud identity (after merging), so it must never
 * happen silently: the table is previewed first, then explicitly confirmed.
 */
export default function JoinTableModal({ code, onClose, onJoin }: Props) {
  const { t } = useI18n();
  const [phase, setPhase] = React.useState<Phase>({ kind: "loading" });

  React.useEffect(() => {
    if (!code) return;
    let active = true;
    setPhase({ kind: "loading" });
    cloudBackupManager()
      .peek(code)
      .then((data) => {
        if (!active) return;
        setPhase({
          kind: "preview",
          tableName: data?.tableName ?? null,
          gameCount: data?.history.length ?? 0,
        });
      })
      .catch(() => {
        if (active) setPhase({ kind: "error" });
      });
    return () => {
      active = false;
    };
  }, [code]);

  const join = async () => {
    if (!code || phase.kind !== "preview") return;
    const tableName = phase.tableName;
    setPhase({ kind: "joining", tableName });
    try {
      await onJoin(code);
      setPhase({ kind: "joined", tableName });
    } catch {
      setPhase({ kind: "error" });
    }
  };

  const title =
    phase.kind === "preview" ||
    phase.kind === "joining" ||
    phase.kind === "joined"
      ? phase.tableName
        ? t.joinTable.named(phase.tableName)
        : t.joinTable.unnamed
      : t.joinTable.title;

  return (
    <Modal
      visible={code !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <Text style={styles.title}>⚓ {title}</Text>

          {phase.kind === "loading" ? (
            <ActivityIndicator
              color={colors.gold}
              style={styles.spinner}
              accessibilityLabel={t.joinTable.busy}
            />
          ) : null}

          {phase.kind === "preview" ? (
            <Text style={styles.message}>
              {t.joinTable.message(phase.gameCount)}
            </Text>
          ) : null}

          {phase.kind === "joining" ? (
            <>
              <Text style={styles.message}>{t.joinTable.busy}</Text>
              <ActivityIndicator color={colors.gold} style={styles.spinner} />
            </>
          ) : null}

          {phase.kind === "joined" ? (
            <Text style={[styles.message, styles.success]}>
              {t.joinTable.success}
            </Text>
          ) : null}

          {phase.kind === "error" ? (
            <Text style={[styles.message, styles.error]}>
              {t.joinTable.error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {phase.kind === "preview" ? (
              <>
                <TouchableOpacity
                  style={styles.confirm}
                  onPress={() => void join()}
                  accessibilityRole="button"
                >
                  <Text style={styles.confirmText}>{t.joinTable.confirm}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancel}
                  onPress={onClose}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelText}>{t.joinTable.cancel}</Text>
                </TouchableOpacity>
              </>
            ) : null}
            {phase.kind === "joined" || phase.kind === "error" ? (
              <TouchableOpacity
                style={styles.confirm}
                onPress={onClose}
                accessibilityRole="button"
              >
                <Text style={styles.confirmText}>{t.common.dismiss}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  message: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  success: { color: colors.positive },
  error: { color: colors.negative },
  spinner: { marginTop: spacing.md, alignSelf: "center" },
  actions: { marginTop: spacing.lg },
  confirm: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  confirmText: { color: colors.bg, fontSize: 14, fontWeight: "800" },
  cancel: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: { color: colors.text, fontSize: 14, fontWeight: "700" },
});

import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  InviteError,
  InviteFailure,
  classifyJoinInput,
  cloudBackupManager,
} from "../cloudSync";
import { INVITE_CODE_LENGTH } from "../tableInvites";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";
import { colors, radius, spacing } from "../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  /**
   * Hands over the table code behind whatever was typed. The caller runs the
   * usual preview-and-confirm sheet: resolving a code must not join anything.
   */
  onResolved: (syncCode: string) => void;
}

/**
 * The guest's side of an invite: type the six characters the host is showing.
 *
 * The same field also accepts a full `SKC1.` table code or a join link, so
 * whichever form of invite someone was handed, this is the one place to put it.
 */
export default function JoinByCodeModal({ visible, onClose, onResolved }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<InviteFailure | "malformed" | null>(
    null
  );

  React.useEffect(() => {
    if (!visible) {
      setDraft("");
      setBusy(false);
      setFailure(null);
    }
  }, [visible]);

  const submit = async () => {
    if (busy) return;
    const input = classifyJoinInput(draft);
    if (!input) {
      setFailure("malformed");
      return;
    }
    if (input.kind === "sync") {
      onResolved(input.code);
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      onResolved(await cloudBackupManager().redeemInvite(input.code));
    } catch (error) {
      setFailure(error instanceof InviteError ? error.reason : "offline");
    } finally {
      setBusy(false);
    }
  };

  const failureText: Record<InviteFailure | "malformed", string> = {
    malformed: t.joinByCode.malformed,
    unknown: t.joinByCode.unknown,
    throttled: t.joinByCode.throttled,
    unsupported: t.joinByCode.unsupported,
    offline: t.joinByCode.offline,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, layout.isTablet && styles.backdropWide]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={false}
        />
        <View
          style={[styles.sheet, layout.isTablet && styles.sheetWide]}
          accessibilityViewIsModal
        >
          {!layout.isTablet ? <View style={styles.grabber} /> : null}

          <View style={styles.header}>
            <View style={styles.identity}>
              <Image
                source={illustrations.compass}
                style={styles.mascot}
                resizeMode="contain"
              />
              <View style={styles.identityCopy}>
                <Text style={styles.title}>{t.joinByCode.title}</Text>
                <Text style={styles.subtitle}>{t.joinByCode.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t.common.dismiss}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={(value) => {
                setDraft(value);
                setFailure(null);
              }}
              onSubmitEditing={() => void submit()}
              // onSubmitEditing never fires on react-native-web, so the
              // keyboard's Enter is handled here too; submitting twice is safe.
              onKeyPress={(event) => {
                if (event.nativeEvent.key === "Enter") void submit();
              }}
              placeholder={t.joinByCode.placeholder}
              placeholderTextColor={colors.textDim}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              returnKeyType="go"
              accessibilityLabel={t.joinByCode.inputLabel(INVITE_CODE_LENGTH)}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (busy || draft.trim().length === 0) && styles.submitButtonDisabled,
              ]}
              onPress={() => void submit()}
              disabled={busy || draft.trim().length === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy || draft.trim().length === 0 }}
            >
              {busy ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitText}>{t.joinByCode.submit}</Text>
              )}
            </TouchableOpacity>

            {failure ? (
              <Text style={styles.error} accessibilityRole="alert">
                {failureText[failure]}
              </Text>
            ) : null}

            <Text style={styles.hint}>{t.joinByCode.hint}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  backdropWide: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxHeight: "91%",
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
  },
  sheetWide: { maxWidth: 480, maxHeight: "86%", borderRadius: radius.lg },
  grabber: {
    width: 42,
    height: 4,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  identity: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  mascot: { width: 48, height: 48, marginEnd: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "800" },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    marginStart: spacing.sm,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "300",
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: "stretch",
  },
  input: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
  },
  submitButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { color: colors.bg, fontSize: 15, fontWeight: "800" },
  error: {
    color: colors.negative,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.md,
  },
});

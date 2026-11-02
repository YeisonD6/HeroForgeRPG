import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectInventorySlice,
  selectIsOverencumbered,
  selectMaxWeightCapacity,
  selectTotalWeight,
} from '../store/selectors';
import {
  clearEquipment,
  InventoryItem,
  toggleEquipItem,
} from '../store/slices/inventorySlice';
import { RPG_THEME } from '../theme/rpgTheme';

export const ArmoryGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { catalog, equippedIds } = useAppSelector(selectInventorySlice);
  const totalWeight = useAppSelector(selectTotalWeight);
  const maxWeightCapacity = useAppSelector(selectMaxWeightCapacity);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);

  const hasEquippedItems = equippedIds.length > 0;

  const renderBonusPills = (item: InventoryItem) => {
    const pills: { label: string; color: string }[] = [];
    if (item.bonusStr > 0) {
      pills.push({
        label: `+${item.bonusStr} STR (Ataque)`,
        color: RPG_THEME.colors.strColor,
      });
    }
    if (item.bonusAgi > 0) {
      pills.push({
        label: `+${item.bonusAgi} AGI (Def/Vel)`,
        color: RPG_THEME.colors.agiColor,
      });
    }
    if (item.bonusInt > 0) {
      pills.push({
        label: `+${item.bonusInt} INT (Magia)`,
        color: RPG_THEME.colors.intColor,
      });
    }
    return pills;
  };

  return (
    <View style={styles.container} testID="zone-c-armory">
      {/* Encabezado de Zona + Botón Desequipar Todo */}
      <View style={styles.zoneHeader}>
        <View style={styles.zoneTagRow}>
          <View style={styles.zonePill}>
            <Text style={styles.zonePillText}>ZONA C</Text>
          </View>
          <View>
            <Text style={styles.zoneTitle}>ARMERÍA &amp; MOCHILA</Text>
            <Text style={styles.zoneSubtitle}>
              Equipados: {equippedIds.length}/{catalog.length} • Peso:{' '}
              {totalWeight}/{maxWeightCapacity} Kg
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retirar todo el equipamiento"
          accessibilityState={{ disabled: !hasEquippedItems }}
          disabled={!hasEquippedItems}
          onPress={() => dispatch(clearEquipment())}
          style={({ pressed }) => [
            styles.clearButton,
            !hasEquippedItems && styles.clearButtonDisabled,
            pressed && hasEquippedItems && styles.clearButtonPressed,
          ]}
          testID="btn-clear-equipment"
        >
          <Text
            style={[
              styles.clearButtonText,
              !hasEquippedItems && styles.clearButtonTextDisabled,
            ]}
          >
            🎒 Desequipar Todo
          </Text>
        </Pressable>
      </View>

      {/* Alerta Visual de Sobrecarga en Zona C */}
      {isOverencumbered && (
        <View style={styles.overloadAlertBox} testID="armory-overload-alert">
          <Text style={styles.overloadAlertTitle}>
            ⚠️ ¡SOBRECARGADO! (-50% Velocidad)
          </Text>
          <Text style={styles.overloadAlertDescription}>
            El peso equipado ({totalWeight} Kg) supera la capacidad máxima de tu
            Fuerza ({maxWeightCapacity} Kg). Retira objetos pesados o entrena
            STR (+2 Kg por punto).
          </Text>
        </View>
      )}

      {/* Cuadrícula de 6 Tarjetas de Equipamiento */}
      <View style={styles.gridContainer}>
        {catalog.map((item) => {
          const isEquipped = equippedIds.includes(item.id);
          const bonusPills = renderBonusPills(item);

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${isEquipped ? 'Desequipar' : 'Equipar'} ${item.name}`}
              accessibilityState={{ selected: isEquipped }}
              onPress={() => dispatch(toggleEquipItem(item.id))}
              style={({ pressed }) => [
                styles.itemCard,
                isEquipped && styles.itemCardEquipped,
                pressed && styles.itemCardPressed,
              ]}
              testID={`armory-item-${item.id}`}
            >
              {/* Fila Superior: Ícono + Estado Equipado/Desequipado */}
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconContainer,
                    isEquipped && styles.iconContainerEquipped,
                  ]}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>

                <View style={styles.cardStatusCol}>
                  <View
                    style={[
                      styles.statusBadge,
                      isEquipped
                        ? styles.statusBadgeEquipped
                        : styles.statusBadgeUnequipped,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isEquipped
                          ? styles.statusBadgeTextEquipped
                          : styles.statusBadgeTextUnequipped,
                      ]}
                      testID={`armory-status-${item.id}`}
                    >
                      {isEquipped ? '✨ EQUIPADO' : 'EN MOCHILA'}
                    </Text>
                  </View>
                  <Text style={styles.weightBadgeText}>⚖️ {item.weight} Kg</Text>
                </View>
              </View>

              {/* Nombre y Categoría */}
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Bonificaciones del Ítem */}
              <View style={styles.bonusesRow}>
                {bonusPills.map((pill) => (
                  <View
                    key={pill.label}
                    style={[styles.bonusPill, { borderColor: pill.color }]}
                  >
                    <Text style={[styles.bonusPillText, { color: pill.color }]}>
                      {pill.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: RPG_THEME.colors.cardGraphite,
    borderRadius: RPG_THEME.radius.lg,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    padding: RPG_THEME.spacing.lg,
    marginBottom: RPG_THEME.spacing.lg,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RPG_THEME.spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zonePill: {
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RPG_THEME.radius.pill,
  },
  zonePillText: {
    color: RPG_THEME.colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  zoneTitle: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  zoneSubtitle: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 11,
  },
  clearButton: {
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
    borderWidth: 1,
    borderRadius: RPG_THEME.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearButtonDisabled: {
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderColor: RPG_THEME.colors.borderSlate,
    opacity: 0.45,
  },
  clearButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  clearButtonText: {
    color: RPG_THEME.colors.crimsonLight,
    fontSize: 11,
    fontWeight: '800',
  },
  clearButtonTextDisabled: {
    color: RPG_THEME.colors.textMuted,
  },
  overloadAlertBox: {
    backgroundColor: RPG_THEME.colors.crimsonMuted,
    borderColor: RPG_THEME.colors.crimsonDanger,
    borderWidth: 2,
    borderRadius: RPG_THEME.radius.md,
    padding: RPG_THEME.spacing.md,
    marginBottom: RPG_THEME.spacing.md,
  },
  overloadAlertTitle: {
    color: RPG_THEME.colors.crimsonLight,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  overloadAlertDescription: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  itemCard: {
    width: '48.5%',
    backgroundColor: RPG_THEME.colors.cardSurface,
    borderRadius: RPG_THEME.radius.md,
    borderWidth: 1.5,
    borderColor: RPG_THEME.colors.borderSlate,
    padding: RPG_THEME.spacing.md,
    justifyContent: 'space-between',
    gap: 6,
  },
  itemCardEquipped: {
    backgroundColor: RPG_THEME.colors.cardElevated,
    borderColor: RPG_THEME.colors.goldPrimary,
    shadowColor: RPG_THEME.colors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  itemCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: RPG_THEME.radius.sm,
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderWidth: 1,
    borderColor: RPG_THEME.colors.borderSlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerEquipped: {
    borderColor: RPG_THEME.colors.goldPrimary,
    backgroundColor: RPG_THEME.colors.goldMuted,
  },
  itemIcon: {
    fontSize: 22,
  },
  cardStatusCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RPG_THEME.radius.pill,
    borderWidth: 1,
  },
  statusBadgeEquipped: {
    backgroundColor: RPG_THEME.colors.goldMuted,
    borderColor: RPG_THEME.colors.goldPrimary,
  },
  statusBadgeUnequipped: {
    backgroundColor: RPG_THEME.colors.bgMidnight,
    borderColor: RPG_THEME.colors.borderSlate,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  statusBadgeTextEquipped: {
    color: RPG_THEME.colors.goldLight,
  },
  statusBadgeTextUnequipped: {
    color: RPG_THEME.colors.textMuted,
  },
  weightBadgeText: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  itemName: {
    color: RPG_THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  itemCategory: {
    color: RPG_THEME.colors.violetLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemDescription: {
    color: RPG_THEME.colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  bonusesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  bonusPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: RPG_THEME.colors.bgMidnight,
  },
  bonusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
});


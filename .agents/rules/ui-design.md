---
trigger: always_on
description: Dark fantasy RPG UI design, accessibility, responsiveness, and component independence rules
---

# UI Design Rules — Dark Fantasy RPG

1. **Visual Identity**:
   - Theme: Dark Fantasy RPG inspired by modern mobile RPG titles.
   - Palette: Midnight blue background (`#0B0F19`), graphite cards (`#151C2C`), slate borders (`#26324D`), gold accents (`#F59E0B`), arcane violet (`#8B5CF6`), electric blue (`#3B82F6`), crimson danger/overload (`#EF4444`), and emerald success (`#10B981`).
2. **Four Independent Visual Zones**:
   - **Zone A (`HeroAvatarHUD`)**: Read-only reactive HUD displaying dynamic avatar expression, class badge, aura glow, equipped weapon icon, HP bar, Mana/Energy bar, and Weight Capacity bar with overload alert.
   - **Zone B (`StatsControlPanel`)**: Interactive attribute training panel with available points badge, STR/AGI/INT level bars, `[-]` and `[+]` buttons with boundary disabling, build presets (`WARRIOR`, `MAGE`, `ROGUE`), and Reset potion button.
   - **Zone C (`ArmoryGrid`)**: Responsive grid of 6 RPG equipment cards showing icon, name, category, stat bonuses, weight in kg, glowing border when equipped, bulk unequip button, and `¡SOBRECARGADO! (-50% Velocidad)` banner when weight exceeds capacity.
   - **Zone D (`ReduxLiveInspector`)**: Boss combat arena with live Boss HP bar, Attack, Heal, and Reset Combat controls, paired with a real-time Redux console showing the last 5 dispatched actions (`[slice/action] -> payload`).
3. **Usability & Accessibility**:
   - Every visible button must perform a real action and have clear disabled states when an operation is invalid.
   - Ensure high text contrast, readable typography, and smooth layout scrolling across mobile and web viewports.

